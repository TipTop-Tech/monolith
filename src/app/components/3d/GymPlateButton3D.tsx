import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center, Float, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

interface GymPlateButton3DProps {
  label: string;
  subLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "warning";
  scale?: number;
  width?: number;
  height?: number;
}

export function GymPlateButton3D({
  label,
  subLabel,
  onClick,
  disabled = false,
  variant = "secondary",
  scale = 1,
  width = 6,
  height = 6
}: GymPlateButton3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Map variants to colors based on the app's Tailwind config
  const colorMap = useMemo(() => {
    switch (variant) {
      case "primary": return "#21d161"; // Approximation of primary hsl(141, 74%, 48%)
      case "danger": return "#ef4444";
      case "warning": return "#f97316";
      case "secondary": 
      default: return "#18181b"; // dark grey/rubber look
    }
  }, [variant]);

  // Material for the plate - rubber/metallic look
  const plateMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorMap,
    roughness: 0.8,
    metalness: variant === "secondary" ? 0.2 : 0.4,
  }), [colorMap, variant]);

  // Material for the text - metallic/embossed
  const textMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: variant === "secondary" ? "#3f3f46" : "#ffffff",
    roughness: 0.4,
    metalness: 0.8,
  }), [variant]);

  // Handle physical interaction animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Target Z position (compression)
    const targetZ = pressed ? -0.5 : 0;
    
    // Target tilt based on hover (slight continuous movement)
    const time = state.clock.getElapsedTime();
    const targetRotX = pressed ? 0.1 : (hovered ? Math.sin(time * 2) * 0.05 : 0);
    const targetRotY = pressed ? -0.1 : (hovered ? Math.cos(time * 2) * 0.05 : 0);

    // Lerp towards targets for smooth "clunky" mechanical feel
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 15);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 10);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 10);
    
    // Add a slight scale pop on hover
    const targetScale = pressed ? 0.95 : (hovered ? 1.02 : 1);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale * scale, delta * 10));
  });

  const fontUrl = "https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_bold.typeface.json";

  return (
    <group>
      <group
        ref={groupRef}
        onPointerDown={(e) => {
          if (disabled) return;
          e.stopPropagation();
          setPressed(true);
        }}
        onPointerUp={(e) => {
          if (disabled) return;
          e.stopPropagation();
          if (pressed) {
            setPressed(false);
            onClick?.();
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerOver={(e) => {
          if (disabled) return;
          e.stopPropagation();
          setHovered(true);
        }}
      >
        {/* Main Plate Body */}
        <mesh receiveShadow castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[width / 2, width / 2, 0.8, 64]} />
          <primitive object={plateMaterial} attach="material" />
        </mesh>

        {/* Outer Rim (Raised Edge) */}
        <mesh receiveShadow castShadow position={[0, 0, 0.4]}>
          <torusGeometry args={[width / 2 - 0.2, 0.2, 16, 64]} />
          <primitive object={plateMaterial} attach="material" />
        </mesh>

        {/* Top Face Text (Embossed) */}
        <group position={[0, 0, 0.4]}>
          <Center>
            <Text3D
              font={fontUrl}
              size={width * 0.15}
              height={0.2}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.02}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
            >
              {label}
              <primitive object={textMaterial} attach="material" />
            </Text3D>
          </Center>
          {subLabel && (
            <Center position={[0, -width * 0.2, 0]}>
              <Text3D
                font={fontUrl}
                size={width * 0.08}
                height={0.1}
                curveSegments={12}
              >
                {subLabel}
                <primitive object={textMaterial} attach="material" />
              </Text3D>
            </Center>
          )}
        </group>
      </group>
    </group>
  );
}
