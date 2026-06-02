import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

export type LensOption = "clear" | "blue_light" | "polarized" | "combo";

const OPTIONS: { id: LensOption; label: string; sub: string; price: number; priceId: string | null }[] = [
  { id: "clear", label: "Clear (CR-39, UV400)", sub: "Included — standard prescription-ready", price: 0, priceId: null },
  { id: "blue_light", label: "Blue Light Filter", sub: "+ HEV 380–460 nm filter coating", price: 40, priceId: "lens_blue_light_v1" },
  { id: "polarized", label: "Polarized Sunglass (Cat 3)", sub: "+ Polarized, 100% UVA/UVB, glare cut", price: 60, priceId: "lens_polarized_v1" },
  { id: "combo", label: "Polarized + Blue Light", sub: "+ Best of both, all-day wear", price: 80, priceId: "lens_combo_v1" },
];

const STORAGE_KEY = "woolet_lens_pref";

export const lensLabelFor = (id: LensOption) => OPTIONS.find((o) => o.id === id)?.label ?? "Clear";
export const lensPriceFor = (id: LensOption) => OPTIONS.find((o) => o.id === id)?.price ?? 0;

interface Props {
  productId: "007" | "009";
  basePrice: number;
  onChange?: (opt: LensOption, totalUsd: number) => void;
}

const LensUpgradeSelector = ({ productId, basePrice, onChange }: Props) => {
  const [selected, setSelected] = useState<LensOption>("clear");

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get("lens") as LensOption | null;
      const fromStorage = sessionStorage.getItem(STORAGE_KEY) as LensOption | null;
      const initial = (fromUrl && OPTIONS.some((o) => o.id === fromUrl) ? fromUrl : fromStorage) as LensOption | null;
      if (initial && OPTIONS.some((o) => o.id === initial)) {
        setSelected(initial);
        onChange?.(initial, basePrice + lensPriceFor(initial));
      }
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (id: LensOption) => {
    setSelected(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
      const url = new URL(window.location.href);
      if (id === "clear") url.searchParams.delete("lens");
      else url.searchParams.set("lens", id);
      window.history.replaceState({}, "", url.toString());
    } catch {
      /* noop */
    }
    pushGtmEvent("select_lens_upgrade", {
      item_name: `Woolet ${productId}`,
      lens_option: id,
      lens_price_upgrade: lensPriceFor(id),
    });
    onChange?.(id, basePrice + lensPriceFor(id));
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "2px", color: "#888", marginBottom: 8, textTransform: "uppercase" }}>
        LENS OPTION
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {OPTIONS.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              onClick={() => handleSelect(o.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 12px",
                background: active ? "#FDF6EB" : "#FFF",
                border: active ? "2px solid #A07A2A" : "2px solid #E0D5C5",
                borderRadius: 6,
                cursor: "pointer",
                textAlign: "left",
              }}
              aria-pressed={active}
            >
              <span>
                <span style={{ display: "block", fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 12, color: "#111" }}>
                  {o.label}
                </span>
                <span style={{ display: "block", fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#666", marginTop: 2 }}>
                  {o.sub}
                </span>
              </span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 12, color: "#A07A2A", whiteSpace: "nowrap" }}>
                {o.price === 0 ? "Included" : `+$${o.price}`}
              </span>
            </button>
          );
        })}
      </div>
      <p style={{ marginTop: 6, fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: 10, color: "#888", lineHeight: 1.5 }}>
        Lens choice is saved with your reservation. Final lens order placed after frame ships.
      </p>
    </div>
  );
};

export default LensUpgradeSelector;
