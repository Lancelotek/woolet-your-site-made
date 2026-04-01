import { Link } from "react-router-dom";
import wooletLogo from "@/assets/woolet-logo.png";

const ProductPage007 = () => (
  <div style={{ background: "#F8F6F1", minHeight: "100vh", fontFamily: "'Barlow', sans-serif" }}>
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 20px" }}>
      <Link to="/en">
        <img src={wooletLogo} alt="Woolet" style={{ height: 22 }} />
      </Link>
      <p style={{ marginTop: 40, color: "#3A3A3A" }}>Coming soon</p>
    </div>
  </div>
);

export default ProductPage007;
