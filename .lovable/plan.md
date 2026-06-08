## Cel
Po skanie zostawiony email zamienia się w konto (magic link). Użytkownik loguje się jednym kliknięciem i widzi swój panel: historię pomiarów, rekomendowany model, zamówienia i edycję profilu.

## Architektura

### Backend (Lovable Cloud)
1. **Auth: magic link (OTP email)** — bez hasła. Wykorzystamy Lovable Auth email templates (brandowane wiadomości w stylu Woolet, EN/PL/FR/ES).
2. **Nowe tabele:**
   - `profiles` (id → auth.users, email, full_name, locale, marketing_opt_in, created_at) + trigger `handle_new_user` auto-tworzący wiersz na sygnał z `auth.users`.
3. **Modyfikacja `scan_sessions`:** dodanie `user_id uuid references auth.users(id)`. Backfill: edge function `link-scans-to-user` przy logowaniu dopina wszystkie sesje o tym samym mailu do `user_id`.
4. **Modyfikacja `founding_members`:** analogicznie kolumna `user_id` + backfill po mailu.
5. **RLS przebudowane:**
   - `scan_sessions`: SELECT/UPDATE tylko dla `auth.uid() = user_id`; anon insert zostaje (skan z telefonu bez logowania).
   - `founding_members`: SELECT tylko dla właściciela, service_role zachowuje pełen dostęp.
   - `profiles`: właściciel czyta/edytuje siebie.
6. **GRANTy** dla każdej nowej tabeli/kolumny zgodnie ze standardem.

### Frontend
1. **Strony pod każdym `/{lang}/`:**
   - `/account/sign-in` — formularz „wyślij mi link" (jeden input email + checkbox prywatności).
   - `/account/callback` — odbiera token z linku, robi `verifyOtp`, woła backfill, redirect do `/account`.
   - `/account` — dashboard z 4 sekcjami: Pomiary, Rekomendacja, Zamówienia, Profil.
2. **`AuthProvider`** (kontekst React + `onAuthStateChange`, `getUser` do walidacji).
3. **Po zakończonym skanie** (FitScan ekran wyniku): dodajemy panel „Zapisz wyniki na koncie — wyślemy link na {email}", jeden klik → magic link. Email z wynikiem jest już w `scan_sessions`, więc backfill automatycznie dopnie historię.
4. **Navbar:** dyskretny link „Account" (ikona) — zalogowany widzi awatar/inicjał, niezalogowany „Sign in".

### Styling
Trzymamy istniejący język: Ink (#0f0f0f), Gold (#c9a84c), Cormorant Garamond nagłówki, Barlow body. Dashboard w wąskiej kolumnie zgodnej z layoutem (`max-w-[680px]`).

## Detale techniczne

- `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/{lang}/account/callback` } })`
- Brak haseł, brak rejestracji „klasycznej". `disable_signup=false`, `auto_confirm_email=false` (i tak magic link weryfikuje).
- Edge function `link-scans-to-user` (verify_jwt=true): bierze `auth.uid()` i email z JWT, UPDATE `scan_sessions SET user_id=$uid WHERE email=$mail AND user_id IS NULL` oraz analogicznie `founding_members`.
- Auth email templates: 1 szablon `magic-link` w brandzie Woolet, czarne tło, gold CTA, EN copy (potem PL/FR/ES).
- Walidacja Zod na froncie i w edge function.
- Wszystkie linki uwzględniają prefix locale (zgodnie z core memory).

## Migracje (kolejność)
1. `profiles` + trigger + RLS + GRANTy.
2. `scan_sessions.user_id` + nowe policy.
3. `founding_members.user_id` + nowe policy.

## Czego NIE robię
- Bez logowania Google (możemy dodać później).
- Bez hasła (czysty magic link).
- Bez zmian w fluxie skanu poza dodaniem CTA „zapisz na koncie" na ekranie wyniku.
- Bez Stripe Customer Portal w tej iteracji — sekcja Zamówienia pokazuje listę z `founding_members`.

## Rezultat
Użytkownik po skanie dostaje opcję „zachowaj wynik" → email → klik → zalogowany na `/account` z historią pomiarów (z mailowych dopasowań), rekomendacją (007/009 z najnowszej sesji), listą zamówień pre-order i edycją profilu.
