// 3D walkthrough data (reference TOUR_STOPS / TOUR_PATH / TOUR_SI). Room sizes are demo values: client to confirm.
export const TOUR_STOPS = [
  { name: "Entrance", desc: "Open-plan living, dining and kitchen straight ahead.", p: 0.05, hot: [3.5, 1.75, 0.35] },
  { name: "Living room", desc: "7 × 4.5 m, with a TV wall, three-seater sofa and space to gather.", p: 0.35, hot: [2.7, 1.25, 2.6] },
  { name: "Kitchen & dining", desc: "Modular kitchen with a window over the sink and a six-seat table.", p: 0.65, hot: [3.4, 1.35, 6.9] },
  { name: "Bedroom", desc: "Master bedroom, 4 × 4.5 m, with an east-facing window.", p: 0.95, hot: [9.0, 1.5, 6.6] },
] as const;

export const TOUR_PATH = [
  { x: 3.5, z: 0.6, yaw: 0 },
  { x: 1.6, z: 1.0, yaw: 46 },
  { x: 1.15, z: 2.6, yaw: 26 },
  { x: 0.95, z: 3.85, yaw: 47 },
  { x: 4.6, z: 4.3, yaw: 84 },
  { x: 6.2, z: 5.05, yaw: 88 },
  { x: 7.0, z: 5.1, yaw: 86 },
  { x: 7.45, z: 4.75, yaw: 60 },
  { x: 7.35, z: 4.35, yaw: 34 },
];

/** path points where the camera stops (one per room) */
export const TOUR_SI = [0, 1, 3, 8];
