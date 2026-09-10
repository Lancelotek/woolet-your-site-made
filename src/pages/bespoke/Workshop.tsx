// Workshop package — token-scoped, identity-free build sheet.
//
// The workshop in Greece is a processor: it reads and writes only inside
// Woolet's system, through this page. It never sees a name, an email or an
// address — only the build reference, the measurements, the fit photo and the
// CAD cross-check it is asked to sign off.

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface Package {
  workshop: string;
  order: {
    reference: string;
    frameName: string | null;
    frontCode: string | null;
    templeCode: string | null;
    finishId: string | null;
    lensType: string | null;
    engravingText: string | null;
    productionBlocked: boolean;
  };
  measurements: Record<string, number | string | null>;
  photo: {
    status: string;
    photoTempleToTempleMm: number | null;
    scanTempleToTempleMm: number | null;
    deltaMm: number | null;
    frameFrontWidthMm: number | null;
    mappingVersion: string | null;
    photoUrl: string | null;
    vtoUrl: string | null;
  } | null;
  verifications: Array<{
    id: string;
    verdict: string | null;
    notes: string | null;
    signed_off_by: string | null;
    signed_off_at: string | null;
    cad_values_frame: Record<string, number | null> | null;
    deltas: Record<string, number | null> | null;
    cadImageUrl: string | null;
    created_at: string;
  }>;
}

const LABELS: Record<string, string> = {
  faceWidthMm: "Face width",
  templeToTempleMm: "Temple to temple",
  bridgeWidthMm: "Bridge",
  pdMm: "PD",
  templeLengthMm: "Temple length",
  notes: "Notes",
};

export default function BespokeWorkshop() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [pkg, setPkg] = useState<Package | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    frontWidthMm: "",
    bridgeMm: "",
    templeLengthMm: "",
    lensWidthMm: "",
    lensHeightMm: "",
    notes: "",
    signedOffBy: "",
  });
  const [cadFile, setCadFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    if (!token) return setError("This link is missing its access token.");
    const { data, error: err } = await supabase.functions.invoke("bespoke-workshop-package", {
      method: "GET",
      body: undefined,
      headers: {},
      // functions.invoke has no query support; pass the token in the path
    } as never).catch(() => ({ data: null, error: new Error("failed") }));
    // Fall back to a direct fetch so the token can travel as a query parameter.
    if (!data) {
      try {
        const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bespoke-workshop-package?token=${encodeURIComponent(token)}`;
        const res = await fetch(base, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string },
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "failed");
        setPkg(body);
        setError(null);
        return;
      } catch {
        setError("This build sheet could not be opened. The link may have been rotated.");
        return;
      }
    }
    if (err) setError("This build sheet could not be opened.");
    else setPkg(data as Package);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitVerification = async (verdict: "approved" | "rework") => {
    setBusy(true);
    setError(null);
    try {
      let cadImagePath: string | null = null;
      if (cadFile) {
        const ext = cadFile.name.split(".").pop() ?? "png";
        const { data: signed, error: signErr } = await supabase.functions.invoke(
          "bespoke-workshop-package",
          { body: { token, cadUploadFor: ext } },
        );
        if (signErr || !signed?.path) throw new Error("upload_failed");
        const { error: upErr } = await supabase.storage
          .from("bespoke-cad")
          .uploadToSignedUrl(signed.path, signed.token, cadFile, { contentType: cadFile.type });
        if (upErr) throw upErr;
        cadImagePath = signed.path;
      }

      const { error: err } = await supabase.functions.invoke("bespoke-workshop-package", {
        body: { token, verification: { ...form, verdict, cadImagePath } },
      });
      if (err) throw err;
      setCadFile(null);
      await load();
    } catch {
      setError("The cross-check could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const rotate = async () => {
    setBusy(true);
    try {
      const { data } = await supabase.functions.invoke("bespoke-workshop-package", {
        body: { token, rotate: true },
      });
      if (data?.workshopToken) {
        window.location.search = `?token=${data.workshopToken}`;
      }
    } finally {
      setBusy(false);
    }
  };

  const card = "border border-cream/10 bg-[#16140F] p-6 sm:p-8";
  const input =
    "mt-1 w-full min-h-[44px] border border-cream/15 bg-transparent px-3 text-sm text-cream focus:border-gold focus:outline-none";
  const primaryBtn =
    "inline-flex min-h-[48px] items-center justify-center bg-gold px-6 text-[12px] uppercase tracking-[0.18em] text-[#1F1B16] disabled:opacity-40";
  const secondaryBtn =
    "inline-flex min-h-[48px] items-center justify-center border border-gold/60 px-6 text-[12px] uppercase tracking-[0.18em] text-gold";

  return (
    <>
      <SEO title="Workshop build sheet — Woolet" description="Internal build sheet." noindex />
      <main className="min-h-screen bg-[#080807] px-5 py-12 text-cream sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
            {pkg?.workshop ?? "Workshop"} · build sheet
          </p>
          <h1 className="mt-3 font-display text-3xl font-light text-[#F8F8F6]">
            {pkg?.order.reference ? `Build ${pkg.order.reference}` : "Build sheet"}
          </h1>

          {error && (
            <p role="alert" className="mt-6 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          {pkg && (
            <>
              {pkg.order.productionBlocked && (
                <p className="mt-6 border border-gold/50 bg-gold/10 p-4 text-sm text-gold">
                  Production is on hold: the fit photo and the scan disagree. Approve the CAD
                  cross-check below to release it.
                </p>
              )}

              <section className={`mt-8 ${card}`}>
                <h2 className="font-display text-xl font-light text-[#F8F8F6]">Specification</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Pattern", pkg.order.frameName],
                    ["Front acetate", pkg.order.frontCode],
                    ["Temple acetate", pkg.order.templeCode],
                    ["Finish", pkg.order.finishId],
                    ["Lenses", pkg.order.lensType],
                    ["Engraving", pkg.order.engravingText],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">{label}</dt>
                      <dd className="text-sm text-cream">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className={`mt-6 ${card}`}>
                <h2 className="font-display text-xl font-light text-[#F8F8F6]">Measurements</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                  {Object.entries(pkg.measurements).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-dim">
                        {LABELS[key] ?? key}
                      </dt>
                      <dd className="text-sm text-cream">
                        {value == null || value === "" ? "—" : key === "notes" ? value : `${value} mm`}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {pkg.photo && (
                <section className={`mt-6 ${card}`}>
                  <h2 className="font-display text-xl font-light text-[#F8F8F6]">Fit photo</h2>
                  <p className="mt-2 text-sm text-cream-dim">
                    Photo {pkg.photo.photoTempleToTempleMm ?? "—"} mm · scan{" "}
                    {pkg.photo.scanTempleToTempleMm ?? "—"} mm · difference {pkg.photo.deltaMm ?? "—"} mm
                    {pkg.photo.mappingVersion ? ` · mapping ${pkg.photo.mappingVersion}` : ""}
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {pkg.photo.photoUrl && (
                      <img src={pkg.photo.photoUrl} alt="Customer fit photo with scale card" loading="lazy" className="w-full border border-cream/10" />
                    )}
                    {pkg.photo.vtoUrl && (
                      <img src={pkg.photo.vtoUrl} alt="Try-on preview with the frame at its cut width" loading="lazy" className="w-full border border-cream/10" />
                    )}
                  </div>
                  <p className="mt-3 text-xs text-cream-dim/70">
                    These links expire in 15 minutes. Do not copy the images out of this system.
                  </p>
                </section>
              )}

              <section className={`mt-6 ${card}`}>
                <h2 className="font-display text-xl font-light text-[#F8F8F6]">CAD cross-check</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["frontWidthMm", "Front width (mm)"],
                      ["bridgeMm", "Bridge (mm)"],
                      ["templeLengthMm", "Temple length (mm)"],
                      ["lensWidthMm", "Lens width (mm)"],
                      ["lensHeightMm", "Lens height (mm)"],
                      ["signedOffBy", "Signed off by"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block text-[11px] uppercase tracking-[0.16em] text-cream-dim">
                      {label}
                      <input
                        className={input}
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      />
                    </label>
                  ))}
                </div>
                <label className="mt-4 block text-[11px] uppercase tracking-[0.16em] text-cream-dim">
                  Notes
                  <textarea
                    rows={3}
                    className={`${input} py-2`}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </label>
                <label className="mt-4 block text-[11px] uppercase tracking-[0.16em] text-cream-dim">
                  CAD drawing
                  <input
                    type="file"
                    accept="image/*,.pdf,.dxf"
                    className="mt-2 block w-full text-sm text-cream"
                    onChange={(e) => setCadFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className={primaryBtn} disabled={busy} onClick={() => submitVerification("approved")}>
                    Approve and release
                  </button>
                  <button type="button" className={secondaryBtn} disabled={busy} onClick={() => submitVerification("rework")}>
                    Flag for rework
                  </button>
                  <button type="button" className={secondaryBtn} disabled={busy} onClick={rotate}>
                    Rotate this link
                  </button>
                </div>
              </section>

              {pkg.verifications.length > 0 && (
                <section className={`mt-6 ${card}`}>
                  <h2 className="font-display text-xl font-light text-[#F8F8F6]">History</h2>
                  <ul className="mt-4 space-y-3 text-sm text-cream-dim">
                    {pkg.verifications.map((v) => (
                      <li key={v.id} className="border-t border-cream/10 pt-3">
                        <span className="text-cream">{v.verdict}</span>
                        {v.signed_off_by ? ` · ${v.signed_off_by}` : ""} ·{" "}
                        {new Date(v.created_at).toLocaleString()}
                        {v.notes ? <div className="mt-1">{v.notes}</div> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
