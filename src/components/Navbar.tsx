import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 px-5 md:px-12 py-5 flex items-center justify-between bg-background/92 backdrop-blur-xl border-b border-border-sub animate-fade-down"
      style={{ borderBottomColor: 'hsl(0 0% 100% / 0.055)' }}>
      <div className="flex items-center gap-5">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="font-display text-2xl text-woolet-white tracking-wide">Woolet</span>
        </Link>
        <span className="hidden md:block text-cream-dim uppercase tracking-[0.22em] border-l pl-5"
          style={{ fontSize: '0.58rem', borderLeftColor: 'hsl(0 0% 100% / 0.055)' }}>
          woolet.co
        </span>
      </div>
      <span className="text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-1"
        style={{ fontSize: '0.55rem' }}>
        Coming Soon
      </span>
    </nav>
  );
};

export default Navbar;
