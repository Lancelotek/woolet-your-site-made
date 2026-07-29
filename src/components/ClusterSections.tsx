import type { ClusterSection } from "@/data/cluster-sections";
import type { SizeSection } from "@/data/size-sections";

type Section = ClusterSection | SizeSection;

const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

/**
 * Renders the long-form, per-entry unique prose used by the numeric
 * SEO landing clusters (/en/size/*, /en/temple/*, /en/bridge/*).
 */
const ClusterSections = ({ sections }: { sections?: Section[] }) => {
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((s, i) => (
        <section key={i} aria-labelledby={`cs-${i}`} style={{ ...wrap, padding: "32px 20px 8px" }}>
          <h2
            id={`cs-${i}`}
            style={{
              fontFamily: "'Newsreader', 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 26,
              margin: "0 0 14px",
              letterSpacing: "-0.3px",
            }}
          >
            {s.h2}
          </h2>
          {s.body.map((p, j) => (
            <p key={j} style={{ fontSize: 15, lineHeight: 1.75, color: "#333", margin: "0 0 14px", maxWidth: 660 }}>
              {p}
            </p>
          ))}
          {s.table && (
            <div style={{ overflowX: "auto", border: "1px solid #E0D5C5", borderRadius: 4, background: "#FFF", marginTop: 6 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 340 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E0D5C5", background: "#FBF7EE" }}>
                    {s.table.head.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        style={{
                          textAlign: "left",
                          padding: "11px 14px",
                          fontWeight: 600,
                          color: "#666",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          fontSize: 11,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((r) => (
                    <tr key={r[0]} style={{ borderBottom: "1px solid #F0E9DA" }}>
                      <th scope="row" style={{ textAlign: "left", padding: "11px 14px", fontWeight: 500, color: "#555", fontSize: 13 }}>
                        {r[0]}
                      </th>
                      <td style={{ padding: "11px 14px", color: "#0B0A09" }}>{r[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </>
  );
};

export default ClusterSections;
