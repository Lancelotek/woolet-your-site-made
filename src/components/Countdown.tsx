import { useState, useEffect, useCallback } from "react";

const Countdown = () => {
  const [target] = useState(() => new Date(Date.now() + 30 * 864e5));

  const calc = useCallback(() => {
    const d = target.getTime() - Date.now();
    if (d <= 0) return { days: "00", hrs: "00", min: "00", sec: "00" };
    return {
      days: String(Math.floor(d / 864e5)).padStart(2, "0"),
      hrs: String(Math.floor((d % 864e5) / 36e5)).padStart(2, "0"),
      min: String(Math.floor((d % 36e5) / 6e4)).padStart(2, "0"),
      sec: String(Math.floor((d % 6e4) / 1e3)).padStart(2, "0"),
    };
  }, [target]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  const units = [
    { val: time.days, label: "Days" },
    { val: time.hrs, label: "Hrs" },
    { val: time.min, label: "Min" },
    { val: time.sec, label: "Sec" },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-cream-dim uppercase tracking-[0.24em]" style={{ fontSize: "0.56rem" }}>
        Launch countdown
      </span>
      <div className="flex items-end gap-2 sm:gap-4">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-end gap-2 sm:gap-4">
            <div className="text-center">
              <span className="font-display text-woolet-white block leading-none text-[2rem] sm:text-[2.8rem]">
                {u.val}
              </span>
              <span className="text-cream-dim uppercase tracking-[0.22em] block mt-1" style={{ fontSize: "0.48rem" }}>
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="font-display text-gold-dim leading-none pb-0.5 text-[2rem] sm:text-[2.8rem]">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
