import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { Suspense } from "react";

/**
 * GlobalCanvas renders a single full-screen WebGL Canvas.
 * It's placed behind (or over) the DOM, and uses `@react-three/drei`'s `View` system
 * to render scenes into tracked <div> elements across the app.
 */
export function GlobalCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[0]">
      <Canvas
        eventSource={document.getElementById("root") || document.body}
        className="pointer-events-none"
        camera={{ position: [0, 0, 10], fov: 40 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <View.Port />
        </Suspense>
      </Canvas>
    </div>
  );
}
