import beforeAfterImg from "@/assets/before-after-fit.png";

const BeforeAfter = () => {
  return (
    <div className="border-t" style={{ borderTopColor: "hsl(0 0% 100% / 0.055)" }}>
      <div className="p-4">
        <div className="text-cream-dim uppercase tracking-[0.22em] mb-3" style={{ fontSize: "0.72rem" }}>
          The Difference
        </div>
        <img
          src={beforeAfterImg}
          alt="Comparison: glasses too small vs perfect fit on a wide face"
          className="w-full rounded-sm"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default BeforeAfter;
