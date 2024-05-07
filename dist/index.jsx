"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const buildVertex = (maxX, maxY, settings) => {
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
const buildMesh = (maxX, maxY, settings) => {
    return {
        maxX,
        maxY,
        vertices: Array.from({ length: settings.vertexCount }, () => buildVertex(maxX, maxY, settings)),
    };
};
const move = (a, dA, r, maxA, applyGravity, settings) => {
    const dice = Math.random() < settings.entropy;
    const modifier = dice ? (Math.random() - 0.5) * settings.dVelocity : 0;
    dA = dA + modifier;
    if (applyGravity) {
        dA += settings.gravity;
    }
    if (dA > settings.maxVelocity) {
        dA = settings.maxVelocity;
    }
    else if (dA < -settings.maxVelocity) {
        dA = -settings.maxVelocity;
    }
    if ((dA > 0 && a > maxA - r) || (dA < 0 && a < r)) {
        return -dA;
    }
    return dA;
};
const tickMesh = (mesh, settings) => {
    return Object.assign(Object.assign({}, mesh), { vertices: mesh.vertices.map((v) => {
            const x = v.x + v.dx;
            const y = v.y + v.dy;
            const dx = move(x, v.dx, v.r, mesh.maxX, false, settings);
            const dy = move(y, v.dy, v.r, mesh.maxY, true, settings);
            return Object.assign(Object.assign({}, v), { x, y, dx, dy });
        }) });
};
const connectingLineSvg = (v, nextVertex, index, settings) => {
    return (<line key={index} x1={v.x} y1={v.y} x2={nextVertex.x} y2={nextVertex.y} stroke={settings.lineStroke} strokeWidth={settings.lineStrokeWidth}/>);
};
const vertexSvg = (v, index, settings) => {
    return (<circle key={index} cx={v.x} cy={v.y} r={v.r} fill={settings.vertexFill} stroke={settings.vertexStroke} strokeWidth={settings.vertexStrokeWidth}/>);
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
};
const MovingMesh = (props) => {
    const settings = (0, react_1.useRef)(Object.assign(Object.assign({}, defaultProps), props));
    const ref = (0, react_1.useRef)(null);
    const animationFrameRef = react_1.default.useRef(0);
    const lastTimeRef = react_1.default.useRef(0);
    const [, setDimensions] = (0, react_1.useState)({ width: 0, height: 0 });
    const [mesh, setMesh] = (0, react_1.useState)(null);
    const tick = (t) => {
        // Limit to fps
        if (lastTimeRef.current === 0 ||
            t - lastTimeRef.current > 1000 / settings.current.fps) {
            setDimensions((prevDimensions) => {
                setMesh((prevMesh) => {
                    return prevMesh &&
                        prevDimensions.width === prevMesh.maxX &&
                        prevDimensions.height === prevMesh.maxY
                        ? tickMesh(prevMesh, settings.current)
                        : buildMesh(prevDimensions.width, prevDimensions.height, settings.current);
                });
                return prevDimensions;
            });
            lastTimeRef.current = t;
        }
    };
    const animate = (time) => {
        tick(time);
        animationFrameRef.current = requestAnimationFrame(animate);
    };
    (0, react_1.useEffect)(() => {
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
    return (<svg ref={ref} width="100%" height="100%" preserveAspectRatio="none">
      {mesh === null || mesh === void 0 ? void 0 : mesh.vertices.map((v, i) => {
            return connectingLineSvg(v, mesh.vertices[(i + 1) % mesh.vertices.length], i, settings.current);
        })}
      {mesh === null || mesh === void 0 ? void 0 : mesh.vertices.map((v, i) => {
            return connectingLineSvg(v, mesh.vertices[(i + 2) % mesh.vertices.length], i, settings.current);
        })}
      {mesh === null || mesh === void 0 ? void 0 : mesh.vertices.map((v, i) => vertexSvg(v, i, settings.current))}
    </svg>);
};
exports.default = MovingMesh;
