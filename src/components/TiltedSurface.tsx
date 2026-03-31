import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type TiltedSurfaceProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function TiltedSurface({
  children,
  className = '',
  disabled = false,
}: TiltedSurfaceProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, []);

  const updatePointerVars = (clientX: number, clientY: number) => {
    const node = nodeRef.current;
    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((clientY - rect.top) / rect.height - 0.5) * 2;
    const clampedPx = Math.max(-1, Math.min(1, px));
    const clampedPy = Math.max(-1, Math.min(1, py));
    const snappedPx = Math.round(clampedPx * 2) / 2;
    const snappedPy = Math.round(clampedPy * 2) / 2;

    node.style.setProperty('--tilt-px', `${snappedPx.toFixed(3)}`);
    node.style.setProperty('--tilt-py', `${snappedPy.toFixed(3)}`);
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !nodeRef.current) {
      return;
    }

    nodeRef.current.dataset.tiltActive = 'true';
    nodeRef.current.dataset.tiltExiting = 'false';
    updatePointerVars(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !nodeRef.current) {
      return;
    }

    updatePointerVars(event.clientX, event.clientY);
  };

  const handlePointerLeave = () => {
    if (!nodeRef.current) {
      return;
    }

    nodeRef.current.dataset.tiltActive = 'false';
    nodeRef.current.dataset.tiltExiting = 'true';
    nodeRef.current.style.setProperty('--tilt-px', '0');
    nodeRef.current.style.setProperty('--tilt-py', '0');

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }

    exitTimerRef.current = window.setTimeout(() => {
      if (!nodeRef.current) {
        exitTimerRef.current = null;
        return;
      }

      if (nodeRef.current.dataset.tiltActive === 'false') {
        nodeRef.current.dataset.tiltExiting = 'false';
      }

      exitTimerRef.current = null;
    }, 320);
  };

  return (
    <div
      ref={nodeRef}
      className={`lesson-tilt-surface ${disabled ? 'lesson-tilt-surface--disabled' : ''} ${className}`.trim()}
      data-tilt-active="false"
      data-tilt-exiting="false"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}
