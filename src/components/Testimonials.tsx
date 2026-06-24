import { useParams } from "react-router-dom";
import { t, isValidLang, type Lang } from "@/lib/i18n";

const Testimonials = () => {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";

  const items = [
    { quote: t(lang, "testimonial.1_quote"), meta: t(lang, "testimonial.1_meta") },
    { quote: t(lang, "testimonial.2_quote"), meta: t(lang, "testimonial.2_meta") },
  ];

  return (
    <div className="flex flex-col gap-3 border-l-2 border-primary/20 pl-4">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="text-foreground leading-relaxed italic" style={{ fontSize: "0.92rem" }}>{item.quote}</div>
          <div className="text-gold-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.7rem" }}>{item.meta}</div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
