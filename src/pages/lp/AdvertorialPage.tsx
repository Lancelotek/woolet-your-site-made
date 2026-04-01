import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { pushGtmEvent } from "@/lib/gtm";
import wooletLogo from "@/assets/woolet-logo.png";

const AdvertorialPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    pushGtmEvent("page_view", {
      page_type: "advertorial",
      awareness_stage: "unaware",
    });
    pushGtmEvent("ViewContent", {
      content_name: "advertorial_why_glasses_fail",
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Dlaczego okulary poszerzają twarz? Przewodnik | Woolet</title>
        <meta
          name="description"
          content="Broad-Faced Professionals: co naprawdę działa przy szukaniu okularów 155mm+. Geometria, materiał, i dlaczego standardowe optyki zawodzą."
        />
        <link
          rel="canonical"
          href="https://woolet.co/en/lp/why-glasses-fail"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Barlow:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div
        style={{
          background: "#F8F6F1",
          minHeight: "100vh",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center" }}>
            <Link to="/en">
              <img src={wooletLogo} alt="Woolet" style={{ height: 22 }} />
            </Link>
          </div>
          {/* 1. Tag bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 20px",
              gap: 8,
            }}
          >
            <span
              style={{
                background: "#EDE9E0",
                color: "#5A4020",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.8px",
                fontFamily: "'Barlow', sans-serif",
                textTransform: "uppercase",
              }}
            >
              Okulary
            </span>
            <span
              style={{
                background: "rgba(202,164,73,0.15)",
                color: "#A07A2A",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.8px",
                fontFamily: "'Barlow', sans-serif",
                textTransform: "uppercase",
              }}
            >
              Editor's Pick
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "#888",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              5 min
            </span>
          </div>

          {/* 2. Headline */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 4vw, 36px)",
              lineHeight: 1.2,
              color: "#111",
              padding: "0 20px",
              margin: "0 0 0 0",
            }}
          >
            Przez lata szukałem okularów które pasują do mojej twarzy.{" "}
            <em style={{ color: "#A07A2A", fontStyle: "italic" }}>
              Oto co odkryłem.
            </em>
          </h1>

          {/* 3. Author row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: "1px solid #E8E4DC",
              gap: 10,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#1A1612",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 14,
                  color: "#CAA449",
                }}
              >
                W
              </span>
            </div>

            {/* Name + date */}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "#111",
                }}
              >
                Marek K.{" "}
                <span style={{ color: "#CAA449" }}>✓</span>
              </span>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  color: "#888",
                }}
              >
                Opublikowano 2 dni temu
              </span>
            </div>

            {/* Views */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#111",
                }}
              >
                92K
              </span>
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 9,
                  color: "#888",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                WYŚWIETLEŃ
              </span>
            </div>
          </div>

          {/* 4. Hero image */}
          <div style={{ padding: "14px 20px 0" }}>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80&auto=format&fit=crop"
              alt="Mężczyzna w okularach — problem dopasowania do szerokiej twarzy"
              style={{
                width: "100%",
                height: "clamp(220px, 30vw, 300px)",
                objectFit: "cover",
                borderRadius: 8,
                display: "block",
              }}
              loading="eager"
            />
          </div>

          {/* 5. Article body */}
          <div style={{ padding: "0 20px" }}>
            {/* Section 1 */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#111",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              Zaczęło się od jednego zdjęcia ze spotkania firmowego.
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#3A3A3A",
                margin: "0 0 12px",
              }}
            >
              Moje okulary wyglądały drogo. Pasowały do dłoni sprzedawcy,
              wyglądały fenomenalnie w opakowaniu. Na mojej twarzy? Coś było
              nie tak. Zbyt wąskie szkła optycznie poszerzały twarz zamiast ją
              kadrować.
            </p>

            {/* Pull quote */}
            <blockquote
              style={{
                borderLeft: "3px solid #A07A2A",
                padding: "10px 14px",
                background: "rgba(160,122,42,0.06)",
                margin: "14px 0",
                borderRadius: 0,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#2A1A00",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                „Przez lata myślałem, że to problem z moją twarzą. Okazało
                się, że problem tkwił w geometrii okularów."
              </p>
            </blockquote>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#3A3A3A",
                margin: "0 0 12px",
              }}
            >
              Kiedy oprawka kończy się przed skronią — mózg odczytuje
              odsłoniętą skórę jako dodatkową szerokość. Standardowe okulary
              (130–148mm) są fizycznie za wąskie dla twarzy powyżej 155mm. To
              nie opinia — to geometria.
            </p>

            {/* Inline image */}
            <img
              src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&q=80&auto=format&fit=crop"
              alt="Okulary na tle — geometria oprawek"
              style={{
                width: "100%",
                height: 130,
                objectFit: "cover",
                borderRadius: 6,
                margin: "12px 0",
                display: "block",
              }}
              loading="lazy"
            />

            {/* Section 2 */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: 18,
                color: "#111",
                margin: "16px 0 8px",
                lineHeight: 1.3,
              }}
            >
              Rynek premium nie istniał.
            </h2>

            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1.75,
                color: "#3A3A3A",
                margin: "0 0 12px",
              }}
            >
              BXL Eyewear: plastik TR90. Fatheadz: casual sportswear. Żaden
              producent nie łączył szerokości 158mm+ z włoskim octanem
              Mazzucchelli. Nie istniała marka pozycjonowana jak Moscot czy
              Oliver Peoples — ale zbudowana wyłącznie dla szerokich twarzy.
              Dlatego powstał Woolet.
            </p>
          </div>

          {/* 6. CTA block */}
          <div style={{ padding: "0 20px" }}>
            <div
              style={{
                background: "#080807",
                borderRadius: 10,
                padding: 18,
                border: "1px solid #2A2520",
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 14,
                    color: "#CAA449",
                    letterSpacing: "3px",
                    fontWeight: 300,
                  }}
                >
                  WOOLET
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: 500,
                    fontSize: 9,
                    color: "#CAA449",
                    letterSpacing: "3px",
                  }}
                >
                  BEZPŁATNY QUIZ
                </span>
              </div>

              {/* Subheadline */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontSize: 15,
                  color: "#F8F8F6",
                  lineHeight: 1.3,
                  marginBottom: 12,
                  marginTop: 0,
                }}
              >
                Sprawdź czy Twoja twarz potrzebuje szerszych oprawek
              </p>

              {/* CTA button */}
              <button
                onClick={() => navigate("/en/fit")}
                style={{
                  width: "100%",
                  background: "#CAA449",
                  color: "#080807",
                  border: "none",
                  padding: "13px 0",
                  borderRadius: 4,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ZMIERZ SZEROKOŚĆ TWARZY →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvertorialPage;
