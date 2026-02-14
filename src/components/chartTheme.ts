/**
 * Shared chart theme for all Recharts components.
 * Uses the Design 2 warm palette so charts blend seamlessly.
 */

/** Primary line/bar colors for per-participant data */
export const CHART_COLORS = [
  '#d4817a', // dusty rose  (participant 1)
  '#c4a882', // warm gold   (participant 2)
  '#7eb08a', // soft green
  '#9bb8ed', // soft blue
  '#d4a574', // warm peach
  '#b08ea2', // muted mauve
];

/** Cartesian grid stroke color */
export const GRID_COLOR = '#362f2a';

/** Tooltip container style (passed as contentStyle) */
export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: '#231f1c',
  border: '1.5px solid #362f2a',
  borderRadius: 6,
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  color: '#e8ddd0',
  fontFamily: "'Kalam', cursive",
  fontSize: 13,
};

/** Tooltip label style (passed as labelStyle) */
export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: '#e8ddd0',
  fontFamily: "'Caveat', cursive",
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 4,
};

/** Tooltip item style (passed as itemStyle) */
export const TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  color: '#9b8e7e',
  fontSize: 13,
  padding: '1px 0',
};

/** Cursor style for bar charts (the rect behind hovered bar) */
export const CURSOR_STYLE: React.SVGProps<SVGRectElement> = {
  fill: 'rgba(212, 129, 122, 0.08)',
};

/** Axis tick style */
export const AXIS_TICK = { fontSize: 11, fill: '#9b8e7e' };

/** Heatmap color (accent) */
export const HEATMAP_COLOR = 'rgba(212, 129, 122,'; // append intensity + ')'
