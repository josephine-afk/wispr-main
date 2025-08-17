'use client';

interface SparklineProps {
  data: number[];
  color?: 'green' | 'red' | 'gray';
  width?: number;
  height?: number;
}

export default function Sparkline({ 
  data, 
  color = 'gray',
  width = 60,
  height = 20 
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  // Calculate min and max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Create SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const colorClasses = {
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    gray: 'stroke-gray-400'
  };

  const fillClasses = {
    green: 'fill-green-500/10',
    red: 'fill-red-500/10',
    gray: 'fill-gray-400/10'
  };

  return (
    <div className="inline-block">
      <svg 
        width={width} 
        height={height} 
        className="overflow-visible"
        style={{ minWidth: width }}
      >
        {/* Area fill */}
        <path
          d={`${points} L ${width} ${height} L 0 ${height} Z`}
          className={fillClasses[color]}
        />
        {/* Line */}
        <path
          d={points}
          fill="none"
          className={colorClasses[color]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots for last point */}
        {data.length > 0 && (
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * height}
            r="2"
            className={`${colorClasses[color]} fill-current`}
          />
        )}
      </svg>
    </div>
  );
}