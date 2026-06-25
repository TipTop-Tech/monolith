import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Edit2, Plus, X, Trash2 } from 'lucide-react';

interface WorkoutCarousel3DProps {
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  visibleSets: any[];
  editingSetId: string | null;
  setEditingSetId: (id: string | null) => void;
  reps: number;
  setReps: (reps: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  setPickerType: (type: 'reps' | 'weight' | 'restTime' | null) => void;
  handleLogSet: () => void;
  setShowEndExerciseConfirm: (show: boolean) => void;
  setSetToDeleteId: (id: string | null) => void;
  currentExercise: any;
}

const DRAG_SENSITIVITY = 0.005;

function CarouselScene({
  slidesCount,
  currentSlide,
  setCurrentSlide,
  visibleSets,
  editingSetId,
  setEditingSetId,
  reps,
  setReps,
  weight,
  setWeight,
  setPickerType,
  handleLogSet,
  setShowEndExerciseConfirm,
  setSetToDeleteId,
  currentExercise,
}: WorkoutCarousel3DProps & { slidesCount: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const anglePerSlide = (Math.PI * 2) / slidesCount;
  const targetRotation = useRef(-anglePerSlide * currentSlide);

  // Initialize rotation on mount
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -anglePerSlide * currentSlide;
      targetRotation.current = -anglePerSlide * currentSlide;
    }
  }, []);

  // Update target rotation when currentSlide changes externally (e.g. from handleLogSet)
  useEffect(() => {
    targetRotation.current = -anglePerSlide * currentSlide;
  }, [currentSlide, anglePerSlide]);

  const [isDragging, setIsDragging] = useState(false);
  const previousX = useRef(0);

  const radius = Math.max(3, slidesCount * 0.8);

  const handlePointerDown = (e: any) => {
    setIsDragging(true);
    previousX.current = e.clientX;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousX.current;
    targetRotation.current += deltaX * DRAG_SENSITIVITY;
    previousX.current = e.clientX;
  };

  const handlePointerUp = (e: any) => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to nearest slide
    const nearestSlide = Math.round(targetRotation.current / anglePerSlide);
    targetRotation.current = nearestSlide * anglePerSlide;

    // Calculate which index we snapped to
    let snappedIndex = Math.round(-nearestSlide) % slidesCount;
    if (snappedIndex < 0) snappedIndex += slidesCount;
    setCurrentSlide(snappedIndex);

    e.target.releasePointerCapture(e.pointerId);
  };

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotation.current,
        5, // Damping factor
        delta
      );
    }
  });

  const getSlidePosition = (index: number): [number, number, number] => {
    const angle = index * anglePerSlide;
    return [Math.sin(angle) * radius, 0, Math.cos(angle) * radius];
  };

  const getSlideRotation = (index: number): [number, number, number] => {
    const angle = index * anglePerSlide;
    return [0, angle, 0];
  };

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Invisible catching cylinder for drags */}
      <mesh visible={false}>
        <cylinderGeometry args={[radius * 1.5, radius * 1.5, 10, 32]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      <group ref={groupRef}>
        {/* Slide 0: End Exercise */}
        <group position={getSlidePosition(0)} rotation={getSlideRotation(0)}>
          <Html transform occlude center distanceFactor={5}>
            <div className="w-[300px] flex items-center justify-center select-none" style={{ pointerEvents: 'none' }}>
              <button
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEndExerciseConfirm(true);
                }}
                className="w-[16rem] aspect-square px-6 bg-secondary bevel-element hover:bg-accent transition-all active:scale-98 flex items-center justify-center"
              >
                <div className="display-font text-xl sm:text-2xl tracking-[0.3em] text-muted-foreground">END EXERCISE</div>
              </button>
            </div>
          </Html>
        </group>

        {/* Slide 1: Active Logging View */}
        <group position={getSlidePosition(1)} rotation={getSlideRotation(1)}>
          <Html transform occlude center distanceFactor={5}>
            <div className="w-[350px] flex flex-col items-center justify-center py-6 sm:py-12 gap-4 sm:gap-6 select-none" style={{ pointerEvents: 'none' }}>
              {editingSetId !== null && (
                <div className="label-font text-[10px] sm:text-xs text-primary mb-2 tracking-[0.2em] bevel-element px-3 py-1 bg-primary/10 rounded-full flex items-center gap-2">
                  <Edit2 size={12} /> EDITING SET
                  <button
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSetId(null);
                      setReps(0);
                      setWeight(0);
                    }}
                    className="ml-2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <button
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPickerType("reps");
                }}
                className="w-3/4 py-3 sm:py-4 chrome-button mb-2"
              >
                {reps > 0 ? (
                  <div className="display-font text-3xl chrome-text">{reps}</div>
                ) : (
                  <div className="label-font text-xs chrome-text tracking-widest">REPS</div>
                )}
              </button>

              <button
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPickerType("weight");
                }}
                className="w-3/4 py-3 sm:py-4 bg-secondary bevel-element hover:bg-accent transition-all active:scale-98"
              >
                {weight > 0 ? (
                  <div className="display-font text-3xl bevel-text">{weight}</div>
                ) : (
                  <div className="label-font text-xs text-muted-foreground">WEIGHT</div>
                )}
              </button>

              <button
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogSet();
                }}
                disabled={reps === 0 || weight === 0}
                className={`w-3/4 py-3 sm:py-4 text-primary-foreground bevel-element hover:opacity-90 transition-all active:scale-98 disabled:opacity-20 flex items-center justify-center gap-2 ${editingSetId !== null ? 'bg-orange-500' : 'bg-primary'}`}
              >
                {editingSetId !== null ? <Edit2 size={18} /> : <Plus size={18} />}
                <span className="label-font">{editingSetId !== null ? 'SAVE EDIT' : 'LOG SET'}</span>
              </button>
            </div>
          </Html>
        </group>

        {/* Slide 2+: Previous Sets */}
        {[...visibleSets].reverse().map((set, arrayIndex) => {
          const index = arrayIndex + 2;
          return (
            <group key={set.id} position={getSlidePosition(index)} rotation={getSlideRotation(index)}>
              <Html transform occlude center distanceFactor={5}>
                <div className="w-[350px] flex flex-col items-center justify-center py-8 select-none" style={{ pointerEvents: 'none' }}>
                  <div className="flex items-center justify-center gap-3 mb-5 sm:mb-8">
                    <div className="label-font text-sm text-muted-foreground">
                      SET {visibleSets.length - arrayIndex}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentExercise) {
                            setEditingSetId(set.id);
                            setReps(set.reps);
                            setWeight(set.weight);
                            setCurrentSlide(1); // Auto scroll to active slide
                          }
                        }}
                        className="text-muted-foreground/50 hover:text-orange-500 transition-colors active:scale-95 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentExercise) {
                            setSetToDeleteId(set.id);
                          }
                        }}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors active:scale-95 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex w-full items-end justify-center gap-6">
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="display-font text-7xl leading-none bevel-text-large mb-2">
                        {set.reps}
                      </div>
                      <div className="label-font text-xs text-muted-foreground">REPS</div>
                    </div>
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="display-font text-7xl leading-none bevel-text-large mb-2">
                        {set.weight}
                      </div>
                      <div className="label-font text-xs text-muted-foreground">LBS</div>
                    </div>
                  </div>
                </div>
              </Html>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export function WorkoutCarousel3D(props: WorkoutCarousel3DProps) {
  const slidesCount = Math.max(3, props.visibleSets.length + 2); // Minimum of 3 slides for a nice circle

  return (
    <div className="w-full min-h-[350px] flex-1 relative touch-none" style={{ touchAction: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CarouselScene slidesCount={slidesCount} {...props} />
      </Canvas>

      {/* Slide Indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0 pb-4 pointer-events-none">
        {Array.from({ length: slidesCount }).map((_, index) => {
          const isActive = index === props.currentSlide;
          // Only render dots for actual slides, not empty padding if visibleSets is empty
          if (index > props.visibleSets.length + 1) return null;

          return (
            <div key={index} className="py-2 px-2 pointer-events-auto cursor-pointer" onClick={() => props.setCurrentSlide(index)}>
              <div
                className={`h-2 rounded-full transition-all duration-200 mx-auto ${isActive ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
