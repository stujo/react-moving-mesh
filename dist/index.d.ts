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
type MmSettingsPublic = Partial<MmSettings>;
declare const MovingMesh: (props: MmSettingsPublic) => import("react/jsx-runtime").JSX.Element;
export default MovingMesh;
//# sourceMappingURL=index.d.ts.map