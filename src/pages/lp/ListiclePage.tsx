import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";

const CARDS = [
  {
    num: "01",
    tag: "GEOMETRIA",
    title: "Zbyt wąska oprawka optycznie POSZERZA twarz",
    body: "To fizyka. Kiedy oprawka kończy się przed skronią, mózg interpretuje odsłoniętą skórę jako dodatkową szerokość. Standard 130–148mm → efekt odwrotny do zamierzonego.",
  },
  {
    num: "02",
    tag: "MATERIAŁ",
    title: "Plastik pod napięciem odkształca się w tygodnie",
    body: "TR90 i tanie acetaty deformują się pod napięciem szerszych twarzy. Włoski octan Mazzucchelli zachowuje kształt — bawołna i celuloida, nie petrochemia.",
  },
  {
    num: "03",
    tag: "ZAWIASY",
    title: "5-baryłkowe zawiasy vs. standardowe 3-baryłkowe",
    body: "Standardowe zawiasy pękają w pierwszym miesiącu przy 158mm. Woolet stosuje 5-baryłkowe PVD Gunmetal, projektowane pod kąt rozwarcia 11°.",
  },
  {
    num: "04",
    tag: "MOSTEK",
    title: "Mostek keyhole 21mm eliminuje ześlizgiwanie",
    body: "Zbyt wąski mostek = poprawianie okularów co 20 minut. Mostek keyhole 21mm dopasowany do szerszego rozstawu oczu. Zero ześlizgu.",
  },
  {
    num: "05",
    tag: "RYNEK",
    title: "Premium + 158mm nie istniało przed Woolet",
    body: "Warby Parker Wide: max 148mm. Cubitts XL: 140mm. Fatheadz: plastik sportowy. Woolet = jedyna marka łącząca 158mm z octanem Mazzucchelli w segmencie premium. Founding Member: 499 zł (standard: 589 zł).",
  },
];

const ListiclePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    pushGtmEvent("page_view", {
      page_type: "listicle",
      awareness_stage: "problem_aware",
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>5 powodów dlaczego standardowe okulary nie pasują na szeroką twarz | Woolet</title>
        <meta
          name="description"
          content="5 technicznych powodów dlaczego okulary 130–148mm nie pasują na twarz 155mm+. Geometria, octan Mazzucchelli, zawiasy 5-baryłkowe, mostek keyhole 21mm."
        />
        <link rel="canonical" href="https://woolet.co/en/lp/5-reasons" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div
        style={{
          background: "#080807",
          minHeight: "100vh",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ padding: "16px 20px 0" }}>
            <Link to="/en">
              <img src={wooletLogo} alt="Woolet" style={{ height: 22 }} />
            </Link>
          </div>

          {/* 1. Hero */}
          <div
            style={{
              background: "linear-gradient(180deg, #1A1000 0%, #080807 100%)",
              padding: "20px 20px 0",
            }}
          >
            {/* Stars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 8,
              }}
            >
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: "#CAA449", fontSize: 11 }}>
                  ★
                </span>
              ))}
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  color: "#7A7570",
                  marginLeft: 6,
                }}
              >
                4.9 · 4,900+ recenzji
              </span>
            </div>

            {/* H1 */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(22px, 3.5vw, 28px)",
                lineHeight: 1.2,
                color: "#F8F8F6",
                margin: 0,
              }}
            >
              5 powodów, dla których standardowe okulary{" "}
              <em style={{ color: "#DBC184", fontStyle: "italic" }}>
                psują proporcje Twojej twarzy
              </em>
            </h1>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 11,
                color: "#9A8E7E",
                marginTop: 6,
                marginBottom: 4,
              }}
            >
              (i dlaczego to nie Twoja twarz jest problemem)
            </p>
          </div>

          {/* 2. Gold separator */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #A07A2A, transparent)",
            }}
          />

          {/* 3. Photo strip */}
          <div
            style={{
              display: "flex",
              gap: 2,
              height: 80,
              padding: "8px 20px 0",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=700&q=80&auto=format&fit=crop"
              alt="Mężczyzna w okularach"
              style={{
                flex: 1.5,
                objectFit: "cover",
                borderRadius: "6px 0 0 6px",
                minWidth: 0,
              }}
              loading="eager"
            />
            <img
              src="https://images.unsplash.com/photo-1574258495973-c54d73bfec77?w=700&q=80&auto=format&fit=crop"
              alt="Detale oprawek"
              style={{
                flex: 1,
                objectFit: "cover",
                borderRadius: "0 6px 6px 0",
                borderLeft: "1px solid #2A2520",
                minWidth: 0,
              }}
              loading="eager"
            />
          </div>

          {/* 4. Issue cards */}
          <div style={{ padding: "10px 20px 0" }}>
            {CARDS.map((card) => (
              <div
                key={card.num}
                style={{
                  background: "#1A1612",
                  borderRadius: 10,
                  padding: 14,
                  border: "1px solid #2A2520",
                  marginBottom: 10,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Left accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 3,
                    background: "#CAA449",
                  }}
                />

                <div style={{ paddingLeft: 10 }}>
                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#CAA449",
                      }}
                    >
                      {card.num}
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 8,
                        letterSpacing: "2px",
                        color: "#7A7570",
                        background: "#2A2520",
                        padding: "2px 6px",
                        borderRadius: 3,
                        fontFamily: "'Barlow', sans-serif",
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      fontSize: 14,
                      color: "#F8F8F6",
                      lineHeight: 1.3,
                      margin: "5px 0 4px",
                    }}
                  >
                    {card.title}
                  </p>

                  {/* Body */}
                  <p
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 300,
                      fontSize: 12,
                      color: "#BBBBBB",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 5. CTA block */}
          <div style={{ margin: "14px 20px 24px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #A07A2A, #CAA449)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              {/* Brand row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontSize: 12,
                    color: "#080807",
                    letterSpacing: "3px",
                  }}
                >
                  WOOLET
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: 8,
                    color: "#080807",
                    letterSpacing: "2px",
                  }}
                >
                  WIDE FIT 158
                </span>
              </div>

              {/* Headline */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: 18,
                  color: "#080807",
                  lineHeight: 1.2,
                  marginBottom: 14,
                  marginTop: 0,
                }}
              >
                Pierwsze premium okulary stworzone dla szerszych twarzy
              </p>

              {/* Button */}
              <button
                onClick={() => navigate("/en")}
                style={{
                  width: "100%",
                  background: "#080807",
                  color: "#CAA449",
                  border: "none",
                  padding: "13px 0",
                  borderRadius: 5,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 10,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                SPRAWDŹ DOPASOWANIE →
              </button>

              {/* Subtext */}
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  color: "rgba(8,8,7,0.55)",
                  textAlign: "center",
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                Włoski octan Mazzucchelli · PVD Gunmetal · 158mm
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListiclePage;
