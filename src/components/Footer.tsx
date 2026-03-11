import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="px-5 md:px-12 py-5 border-t flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-up"
      style={{ borderTopColor: 'hsl(0 0% 100% / 0.055)' }}>
      <span className="text-cream-dim opacity-40 tracking-wider" style={{ fontSize: '0.57rem' }}>
        © 2025 JAY23 LLC — woolet.co — Eyewear for Wide Faces
      </span>
      <div className="flex gap-5 flex-wrap justify-center">
        {[
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Return Policy", href: "/return-policy" },
          { label: "support@woolet.co", href: "mailto:support@woolet.co" },
        ].map((link) => (
          <FooterLink key={link.label} {...link} />
        ))}
      </div>
    </footer>
  );
};

const FooterLink = ({ label, href }: { label: string; href: string }) => {
  const isInternal = href.startsWith("/");
  const className = "text-cream-dim no-underline uppercase tracking-[0.2em] hover:text-primary transition-colors";
  const style = { fontSize: '0.55rem' };

  if (isInternal) {
    return <Link to={href} className={className} style={style}>{label}</Link>;
  }
  return <a href={href} className={className} style={style}>{label}</a>;
};

export default Footer;
