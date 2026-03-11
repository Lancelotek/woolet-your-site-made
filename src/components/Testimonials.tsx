const Testimonials = () => {
  const items = [
    { quote: '"I\'ve been searching for frames this wide for years. Woolet is the first brand that gets it."', meta: "Marek W.  ·  161mm  ·  Warsaw" },
    { quote: '"Finally no more marks on my temples at the end of the day."', meta: "James R.  ·  158mm  ·  London" },
  ];

  return (
    <div className="flex flex-col gap-3 border-l-2 border-primary/20 pl-4">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="text-foreground leading-relaxed italic" style={{ fontSize: "0.75rem" }}>{item.quote}</div>
          <div className="text-gold-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.55rem" }}>{item.meta}</div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
