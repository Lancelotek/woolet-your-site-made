interface FitRangeChartProps {
  competitorMin: number;
  competitorMax: number;
  competitorLabel: string;
}

const AXIS_MIN = 120;
const AXIS_MAX = 175;
const WOOLET_MIN = 150;
const WOOLET_MAX = 172;

const CHART_LEFT = 60;
const CHART_RIGHT = 720;
const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;

const toX = (mm: number) => {
  const clamped = Math.max(AXIS_MIN, Math.min(AXIS_MAX, mm));
  return CHART_LEFT + ((clamped - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * CHART_WIDTH;
};

const FitRangeChart = ({ competitorMin, competitorMax, competitorLabel }: FitRangeChartProps) => {
  const wooletX = toX(WOOLET_MIN);
  const wooletW = toX(WOOLET_MAX) - wooletX;
  const compX = toX(competitorMin);
  const compW = toX(competitorMax) - compX;

  const ariaLabel = `Face-width coverage chart. Woolet covers 150 to 172 millimetres. ${competitorLabel} covers ${competitorMin} to ${competitorMax} millimetres.`;

  const ticks = [120, 130, 140, 150, 160, 170];

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        viewBox="0 0 760 200"
        role="img"
        aria-label={ariaLabel}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Woolet band */}
        <text x={wooletX} y="30" fontFamily="'Barlow', sans-serif" fontSize="11" fill="#A07A2A" letterSpacing="1.2">
          WOOLET — DESIGNED FOR WIDE FACES
        </text>
        <rect x={wooletX} y="40" width={wooletW} height="34" rx="8" fill="#CAA449" />
        <text
          x={wooletX + wooletW / 2}
          y="62"
          textAnchor="middle"
          fontFamily="'Barlow', sans-serif"
          fontSize="13"
          fontWeight={600}
          fill="#080807"
        >
          150–172 mm bespoke
        </text>

        {/* Competitor band */}
        <text x={compX} y="100" fontFamily="'Barlow', sans-serif" fontSize="11" fill="#666" letterSpacing="1.2">
          {competitorLabel.toUpperCase()}
        </text>
        <rect x={compX} y="110" width={compW} height="34" rx="8" fill="#3a352c" />
        <text
          x={compX + compW / 2}
          y="132"
          textAnchor="middle"
          fontFamily="'Barlow', sans-serif"
          fontSize="13"
          fontWeight={500}
          fill="#EDE7D9"
        >
          ~{competitorMin}–{competitorMax} mm
        </text>

        {/* Axis */}
        <line x1={CHART_LEFT} y1="170" x2={CHART_RIGHT} y2="170" stroke="#C8BFAE" strokeWidth="1" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1="168" x2={toX(t)} y2="176" stroke="#C8BFAE" strokeWidth="1" />
            <text x={toX(t)} y="190" textAnchor="middle" fontFamily="'Barlow', sans-serif" fontSize="11" fill="#888">
              {t}
            </text>
          </g>
        ))}
        <text x={CHART_RIGHT} y="190" textAnchor="end" fontFamily="'Barlow', sans-serif" fontSize="10" fill="#888" letterSpacing="1">
          mm face width
        </text>
      </svg>
    </div>
  );
};

export default FitRangeChart;
