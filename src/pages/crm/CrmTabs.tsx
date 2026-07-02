import { Link, useParams } from "react-router-dom";

const T = {
  ink: "#efe9df",
  inkMute: "rgba(239,233,223,0.42)",
  gold: "#c2a05a",
  hair: "rgba(239,233,223,0.10)",
};

type Tab = "reservations" | "gsc";

const TABS: { id: Tab; label: string; path: (lang: string) => string }[] = [
  { id: "reservations", label: "Reservations", path: (l) => `/${l}/crm` },
  { id: "gsc", label: "GSC Tracking", path: (l) => `/${l}/crm/gsc` },
];

export function CrmTabs({ current }: { current: Tab }) {
  const { lang = "en" } = useParams<{ lang: string }>();

  return (
    <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {TABS.map((t) => {
        const active = t.id === current;
        return (
          <Link
            key={t.id}
            to={t.path(lang)}
            style={{
              padding: "8px 14px",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: active ? T.gold : T.inkMute,
              borderBottom: active ? `1px solid ${T.gold}` : "1px solid transparent",
              textDecoration: "none",
              transition: "color 0.15s",
              fontFamily: "'Barlow', 'Inter', sans-serif",
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
