import React, { useEffect, useRef, useState } from "react";

interface MmVertex {
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
}

interface MmMesh {
  maxX: number;
  maxY: number;
  vertices: MmVertex[];
}

const buildVertex = (
  maxX: number,
  maxY: number,
  settings: MmSettings
): MmVertex => {
  const velocity = settings.velocity;
  const radius = settings.radius;

  return {
    x: Math.random() * maxX,
    y: Math.random() * maxY,
    dx: Math.random() * velocity - velocity / 2,
    dy: Math.random() * velocity - velocity / 2,
    r: radius,
  };
};

const buildMesh = (
  maxX: number,
  maxY: number,
  settings: MmSettings
): MmMesh => {
  return {
    maxX,
    maxY,
    vertices: Array.from({ length: settings.vertexCount }, () =>
      buildVertex(maxX, maxY, settings)
    ),
  };
};

const move = (
  a: number,
  dA: number,
  r: number,
  maxA: number,
  applyGravity: boolean,
  settings: MmSettings
) => {
  const dice = Math.random() < settings.entropy;
  const modifier = dice ? (Math.random() - 0.5) * settings.dVelocity : 0;
  dA = dA + modifier;

  if (applyGravity) {
    dA += settings.gravity;
  }

  if (dA > settings.maxVelocity) {
    dA = settings.maxVelocity;
  } else if (dA < -settings.maxVelocity) {
    dA = -settings.maxVelocity;
  }

  if ((dA > 0 && a > maxA - r) || (dA < 0 && a < r)) {
    return -dA;
  }
  return dA;
};

const tickMesh = (mesh: MmMesh, settings: MmSettings): MmMesh => {
  return {
    ...mesh,
    vertices: mesh.vertices.map((v: MmVertex) => {
      const x: number = v.x + v.dx;
      const y: number = v.y + v.dy;
      const dx: number = move(x, v.dx, v.r, mesh.maxX, false, settings);
      const dy: number = move(y, v.dy, v.r, mesh.maxY, true, settings);
      return { ...v, x, y, dx, dy };
    }),
  };
};

/**
 * Props for the MovingMesh component.
 */
export interface MmSettings {
  /**
   * Frames per second for the animation.
   * @default 15
   */
  fps: number;
  /**
   * Number of vertices in the mesh.
   * @default 5
   */
  vertexCount: number;
  /**
   * Velocity of the vertices.
   * @default 0.1
   */
  velocity: number;
  /**
   * Maximum velocity of the vertices.
   * @default 1.5
   */
  maxVelocity: number;
  /**
   * Entropy factor affecting the randomness of vertex movement.
   * @default 0.9
   */
  entropy: number;
  /**
   * Radius of the vertices.
   * @default 5
   */
  radius: number;
  /**
   * Delta velocity applied to the vertices.
   * @default 0.05
   */
  dVelocity: number;
  /**
   * Fill color of the vertices.
   * @default "white"
   */
  vertexFill: string;
  /**
   * Stroke color of the vertices.
   * @default "white"
   */
  vertexStroke: string;
  /**
   * Stroke width of the vertices.
   * @default 0
   */
  vertexStrokeWidth: number;
  /**
   * Stroke color of the connecting lines.
   * @default "white"
   */
  lineStroke: string;
  /**
   * Stroke width of the connecting lines.
   * @default 2
   */
  lineStrokeWidth: number;
  /**
   * Gravity applied to the vertices.
   * @default 0
   */
  gravity: number;
}

const connectingLineSvg = (
  v: MmVertex,
  nextVertex: MmVertex,
  index: number,
  settings: MmSettings
) => {
  return (
    <line
      key={index}
      x1={v.x}
      y1={v.y}
      x2={nextVertex.x}
      y2={nextVertex.y}
      stroke={settings.lineStroke}
      strokeWidth={settings.lineStrokeWidth}
    />
  );
};

const vertexSvg = (v: MmVertex, index: number, settings: MmSettings) => {
  return (
    <circle
      key={index}
      cx={v.x}
      cy={v.y}
      r={v.r}
      fill={settings.vertexFill}
      stroke={settings.vertexStroke}
      strokeWidth={settings.vertexStrokeWidth}
    />
  );
};

// Declare default props
const defaultProps = {
  fps: 15,
  gravity: 0,
  vertexCount: 5,
  velocity: 0.1,
  maxVelocity: 1.5,
  entropy: 0.9,
  radius: 5,
  dVelocity: 0.05,
  vertexFill: "white",
  vertexStroke: "white",
  vertexStrokeWidth: 0,
  lineStroke: "white",
  lineStrokeWidth: 2,
} as MmSettings;

type MmSettingsPublic = Partial<MmSettings>;

const MovingMesh = (props: MmSettingsPublic) => {
  const settings = useRef<MmSettings>({ ...defaultProps, ...props });
  const ref = useRef(null);
  const animationFrameRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);
  const [, setDimensions] = useState({ width: 0, height: 0 });
  const [mesh, setMesh] = useState<MmMesh | null>(null);

  const tick = (t: number) => {
    // Limit to fps
    if (
      lastTimeRef.current === 0 ||
      t - lastTimeRef.current > 1000 / settings.current.fps
    ) {
      setDimensions((prevDimensions) => {
        setMesh((prevMesh) => {
          return prevMesh &&
            prevDimensions.width === prevMesh.maxX &&
            prevDimensions.height === prevMesh.maxY
            ? tickMesh(prevMesh, settings.current)
            : buildMesh(
                prevDimensions.width,
                prevDimensions.height,
                settings.current
              );
        });
        return prevDimensions;
      });
      lastTimeRef.current = t;
    }
  };

  const animate = (time: number) => {
    tick(time);
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      console.log(`ResizeObserver: ${entries.length}`, entries);
      entries.forEach((entry) => {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });
    });

    if (observeTarget) {
      resizeObserver.observe(observeTarget);
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <svg ref={ref} width="100%" height="100%" preserveAspectRatio="none">
      {mesh?.vertices.map((v: MmVertex, i) => {
        return connectingLineSvg(
          v,
          mesh.vertices[(i + 1) % mesh.vertices.length],
          i,
          settings.current
        );
      })}
      {mesh?.vertices.map((v: MmVertex, i) => {
        return connectingLineSvg(
          v,
          mesh.vertices[(i + 2) % mesh.vertices.length],
          i,
          settings.current
        );
      })}
      {mesh?.vertices.map((v: MmVertex, i) =>
        vertexSvg(v, i, settings.current)
      )}
    </svg>
  );
};

export default MovingMesh;
