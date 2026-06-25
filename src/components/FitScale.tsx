import { useRef } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";

export type FitScaleRow = {
  label: string;
  unit?: string;
  min: number;
  max: number;
  standard: [number, number];
  woolet: [number, number];
  standardLabel?: string;
  wooletLabel?: string;
};

export type FitScaleProps = {
  rows: FitScaleRow[];
  marker?: { row: number; value: number; label?: string } | null;
  playOnView?: boolean;
  className?: string;
};

const ARCHIVO = "'Archivo', 'Barlow', system-ui, sans-serif";
const COLORS = {
  cardBg: "#100f0d",
  border: "rgba(255,255,255,0.08)",
  track: "rgba(255,255,255,0.13)",
  label: "#8f897b",
  tick: "#6e685c",
  brick: "#A05A3F",
  brickLabel: "#C98B6E",
  gold: "#D8B86A",
  goldGlow: "rgba(216,184,106,0.35)",
};

const HATCH =
  "repeating-linear-gradient(45deg, rgba(160,90,63,0.22) 0 6px, rgba(160,90,63,0) 6px 12px)";

const pct = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

function niceTicks(min: number, max: number, target = 5): number[] {
  const span = max - min;
  const raw = span / (target - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * mag);
  const step = candidates.find((c) => span / c <= target + 1) ?? raw;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  if (ticks[0] !== min) ticks.unshift(min);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

type RowProps = {
  row: FitScaleRow;
  index: number;
  inView: boolean;
  reduce: boolean;
  marker?: { row: number; value: number; label?: string } | null;
};

function ScaleRow({ row, index, inView, reduce, marker }: RowProps) {
  const rowDelay = index * 0.3;
  const ticks = niceTicks(row.min, row.max, 5);

  const stdLeft = pct(row.standard[0], row.min, row.max);
  const stdW = pct(row.standard[1], row.min, row.max) - stdLeft;
  const wLeft = pct(row.woolet[0], row.min, row.max);
  const wW = pct(row.woolet[1], row.min, row.max) - wLeft;

  const showMarker = marker && marker.row === index;
  const markerLeft = showMarker ? pct(marker!.value, row.min, row.max) : 0;

  const animate = inView || reduce;
  const ease: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

  return (
    <div style={{ width: "100%" }}>
      {/* Header: label left / unit right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 22,
          fontFamily: ARCHIVO,
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: COLORS.label,
          fontWeight: 500,
        }}
      >
        <span>{row.label}</span>
        <span>{row.unit ?? "mm"}</span>
      </div>

      {/* Track area — reserves vertical space (labels above + band + ticks below) */}
      <div style={{ position: "relative", height: 76 }}>
        {/* Band labels (above bands) */}
        <div style={{ position: "absolute", inset: 0, top: 0, height: 18 }}>
          {/* Standard label */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={animate ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.35,
              delay: reduce ? 0 : rowDelay + 0.95,
              ease,
            }}
            style={{
              position: "absolute",
              left: `${stdLeft + stdW / 2}%`,
              transform: "translateX(-50%)",
              fontFamily: ARCHIVO,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLORS.brickLabel,
              whiteSpace: "nowrap",
            }}
          >
            ✕ {row.standardLabel ?? "Standard"}
          </motion.div>

          {/* Woolet label */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={animate ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.35,
              delay: reduce ? 0 : rowDelay + 1.15,
              ease,
            }}
            style={{
              position: "absolute",
              left: `${wLeft + wW / 2}%`,
              transform: "translateX(-50%)",
              fontFamily: ARCHIVO,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLORS.gold,
              whiteSpace: "nowrap",
              fontWeight: 600,
            }}
          >
            ✓ {row.wooletLabel ?? "Woolet"}
          </motion.div>
        </div>

        {/* Track line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 36,
            height: 1,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={animate ? { scaleX: 1 } : {}}
            transition={{
              duration: 0.55,
              delay: reduce ? 0 : rowDelay,
              ease,
            }}
            style={{
              height: "100%",
              background: COLORS.track,
              transformOrigin: "left center",
            }}
          />
        </div>

        {/* Standard (brick, hatched outlined box) */}
        <div
          style={{
            position: "absolute",
            left: `${stdLeft}%`,
            width: `${stdW}%`,
            top: 28,
            height: 16,
            overflow: "visible",
          }}
        >
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={animate ? { scaleX: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.4,
              delay: reduce ? 0 : rowDelay + 0.5,
              ease,
            }}
            style={{
              width: "100%",
              height: "100%",
              border: `1px solid ${COLORS.brick}`,
              background: HATCH,
              transformOrigin: "left center",
              borderRadius: 1,
            }}
          />
        </div>

        {/* Woolet (gold solid) */}
        <div
          style={{
            position: "absolute",
            left: `${wLeft}%`,
            width: `${wW}%`,
            top: 26,
            height: 20,
            overflow: "visible",
          }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={
              animate
                ? {
                    scaleX: 1,
                    boxShadow: [
                      `0 0 0 0 ${COLORS.goldGlow}`,
                      `0 0 22px 2px ${COLORS.goldGlow}`,
                      `0 0 0 1px ${COLORS.gold}`,
                    ],
                  }
                : {}
            }
            transition={{
              scaleX: {
                duration: 0.55,
                delay: reduce ? 0 : rowDelay + 0.7,
                ease,
              },
              boxShadow: {
                duration: 1.1,
                delay: reduce ? 0 : rowDelay + 0.7,
                times: [0, 0.5, 1],
                ease,
              },
            }}
            whileHover={{ scale: 1.02, filter: "brightness(1.12)" }}
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, #b8923f 0%, #dcbd6e 100%)",
              transformOrigin: "left center",
              borderRadius: 2,
              cursor: "default",
            }}
            title={`${row.woolet[0]}–${row.woolet[1]} ${row.unit ?? "mm"}`}
          />
        </div>

        {/* Tick numbers below the track */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 54,
            height: 22,
          }}
        >
          {ticks.map((t, i) => {
            const left = pct(t, row.min, row.max);
            return (
              <motion.div
                key={`${t}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={animate ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.35,
                  delay: reduce ? 0 : rowDelay + 0.55 + i * 0.04,
                  ease,
                }}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  transform: "translateX(-50%)",
                  fontFamily: ARCHIVO,
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  color: COLORS.tick,
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </motion.div>
            );
          })}
        </div>

        {/* "your range" caret under gold band */}
        {!showMarker && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={animate ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: reduce ? 0 : rowDelay + 1.3,
              ease: [0.34, 1.3, 0.64, 1],
            }}
            style={{
              position: "absolute",
              left: `${wLeft + wW / 2}%`,
              transform: "translateX(-50%)",
              top: 76,
              fontFamily: ARCHIVO,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: COLORS.gold,
              opacity: 0.7,
              whiteSpace: "nowrap",
            }}
          >
            ↓ your range
          </motion.div>
        )}

        {/* Marker pin */}
        <AnimatePresence>
          {showMarker && (
            <motion.div
              key="marker"
              initial={{ opacity: 0, y: -8 }}
              animate={animate ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : rowDelay + 1.4,
                ease,
              }}
              style={{
                position: "absolute",
                left: `${markerLeft}%`,
                transform: "translateX(-50%)",
                top: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: ARCHIVO,
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: COLORS.gold,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  background: COLORS.cardBg,
                  padding: "2px 6px",
                  border: `1px solid ${COLORS.gold}`,
                  borderRadius: 2,
                }}
              >
                {marker?.label ?? `you · ${marker?.value} ${row.unit ?? "mm"}`}
              </span>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: COLORS.gold,
                  transform: "rotate(45deg)",
                  marginTop: 14,
                  boxShadow: `0 0 12px ${COLORS.goldGlow}`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function FitScale({
  rows,
  marker = null,
  playOnView = true,
  className,
}: FitScaleProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inViewRaw = useInView(ref, { once: true, amount: 0.4 });
  const reduce = !!useReducedMotion();
  const inView = playOnView ? inViewRaw : true;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        background: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 3,
        padding: "clamp(24px, 4vw, 48px)",
        display: "flex",
        flexDirection: "column",
        gap: 40,
        width: "100%",
      }}
    >
      {rows.map((row, i) => (
        <ScaleRow
          key={`${row.label}-${i}`}
          row={row}
          index={i}
          inView={inView}
          reduce={reduce}
          marker={marker}
        />
      ))}
    </div>
  );
}
