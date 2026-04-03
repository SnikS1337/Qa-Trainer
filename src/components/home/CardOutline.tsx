import { useEffect, useRef, useState } from 'react';

function buildLessonOutlinePaths(width: number, height: number) {
  const inset = 1.5;
  const left = inset;
  const top = inset;
  const right = Math.max(width - inset, left);
  const bottom = Math.max(height - inset, top);
  const radius = Math.min(24, (right - left) / 2, (bottom - top) / 2);
  const centerX = width / 2;

  const leftPath = [
    `M ${centerX} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    `L ${centerX} ${top}`,
  ].join(' ');

  const rightPath = [
    `M ${centerX} ${bottom}`,
    `L ${right - radius} ${bottom}`,
    `Q ${right} ${bottom} ${right} ${bottom - radius}`,
    `L ${right} ${top + radius}`,
    `Q ${right} ${top} ${right - radius} ${top}`,
    `L ${centerX} ${top}`,
  ].join(' ');

  return [leftPath, rightPath];
}

type CardOutlineProps = {
  color: string;
  hovered?: boolean;
  opening?: boolean;
  variant?: 'interactive' | 'ambient';
  pulseMode?: 'default' | 'soft';
};

export default function CardOutline({
  color,
  hovered = false,
  opening = false,
  variant = 'interactive',
  pulseMode = 'default',
}: CardOutlineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    const updateSize = () => {
      const nextWidth = node.clientWidth;
      const nextHeight = node.clientHeight;

      setSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      );
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const isAmbient = variant === 'ambient';
  const outlineProgress = isAmbient ? 1 : opening ? 1 : hovered ? 0.5 : 0;
  const outlineDashArray = `${outlineProgress} 1`;
  const outlineTransition = opening
    ? '620ms cubic-bezier(0.22, 1, 0.36, 1)'
    : '420ms cubic-bezier(0.22, 1, 0.36, 1)';
  const hasSize = size.width > 0 && size.height > 0;
  const viewBoxWidth = Math.max(size.width, 1);
  const viewBoxHeight = Math.max(size.height, 1);
  const outlineInset = 1.5;
  const outlineRectWidth = Math.max(viewBoxWidth - outlineInset * 2, 0);
  const outlineRectHeight = Math.max(viewBoxHeight - outlineInset * 2, 0);
  const outlineRectRadius = Math.min(24, outlineRectWidth / 2, outlineRectHeight / 2);
  const [leftPath, rightPath] = buildLessonOutlinePaths(viewBoxWidth, viewBoxHeight);
  const paths = [
    { id: 'left', d: leftPath },
    { id: 'right', d: rightPath },
  ];
  const isActive = isAmbient || opening || hovered;
  const isSoftPulse = isAmbient && pulseMode === 'soft';
  const glowOpacity = isAmbient ? (isSoftPulse ? 0.16 : 0.22) : 0.5;
  const lineOpacity = isAmbient ? (isSoftPulse ? 0.38 : 0.5) : 1;
  const glowFilter = isAmbient
    ? `blur(2px) drop-shadow(0 0 ${isSoftPulse ? '7px' : '9px'} ${color}38) drop-shadow(0 0 ${isSoftPulse ? '12px' : '16px'} ${color}18)`
    : `blur(3px) drop-shadow(0 0 10px ${color}88) drop-shadow(0 0 24px ${color}55)`;
  const lineFilter = isAmbient
    ? `drop-shadow(0 0 ${isSoftPulse ? '4px' : '5px'} ${color}44) drop-shadow(0 0 ${isSoftPulse ? '8px' : '11px'} ${color}1c)`
    : `drop-shadow(0 0 6px ${color}aa) drop-shadow(0 0 18px ${color}55)`;
  const pulseClassName = isAmbient
    ? isSoftPulse
      ? 'ambient-card-outline-pulse-soft'
      : 'ambient-card-outline-pulse'
    : undefined;
  const lineCap = isAmbient ? 'butt' : 'round';

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
    >
      {hasSize &&
        (isAmbient ? (
          <g className={pulseClassName}>
            <rect
              x={outlineInset}
              y={outlineInset}
              width={outlineRectWidth}
              height={outlineRectHeight}
              rx={outlineRectRadius}
              ry={outlineRectRadius}
              pathLength={1}
              fill="none"
              stroke={`color-mix(in srgb, ${color} 82%, white 18%)`}
              strokeWidth="2.4"
              strokeLinecap="butt"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                opacity: isActive ? glowOpacity : 0,
                strokeDasharray: outlineDashArray,
                transition: `opacity ${outlineTransition}, stroke-dasharray ${outlineTransition}`,
                filter: isActive ? glowFilter : 'none',
              }}
            />
            <rect
              x={outlineInset}
              y={outlineInset}
              width={outlineRectWidth}
              height={outlineRectHeight}
              rx={outlineRectRadius}
              ry={outlineRectRadius}
              pathLength={1}
              fill="none"
              stroke={`color-mix(in srgb, ${color} 88%, white 12%)`}
              strokeWidth="1.55"
              strokeLinecap="butt"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                opacity: isActive ? lineOpacity : 0,
                strokeDasharray: outlineDashArray,
                transition: `opacity ${outlineTransition}, stroke-dasharray ${outlineTransition}`,
                filter: isActive ? lineFilter : 'none',
              }}
            />
          </g>
        ) : (
          paths.map((path) => (
            <g key={path.id} className={pulseClassName}>
              <path
                d={path.d}
                pathLength={1}
                fill="none"
                stroke={`color-mix(in srgb, ${color} 82%, white 18%)`}
                strokeWidth="2.4"
                strokeLinecap={lineCap}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  opacity: isActive ? glowOpacity : 0,
                  strokeDasharray: outlineDashArray,
                  transition: `opacity ${outlineTransition}, stroke-dasharray ${outlineTransition}`,
                  filter: isActive ? glowFilter : 'none',
                }}
              />
              <path
                d={path.d}
                pathLength={1}
                fill="none"
                stroke={`color-mix(in srgb, ${color} 88%, white 12%)`}
                strokeWidth="1.55"
                strokeLinecap={lineCap}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  opacity: isActive ? lineOpacity : 0,
                  strokeDasharray: outlineDashArray,
                  transition: `opacity ${outlineTransition}, stroke-dasharray ${outlineTransition}`,
                  filter: isActive ? lineFilter : 'none',
                }}
              />
            </g>
          ))
        ))}
    </svg>
  );
}
