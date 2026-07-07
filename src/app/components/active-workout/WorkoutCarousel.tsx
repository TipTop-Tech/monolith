import React, { useEffect, useState } from 'react';
import { Edit2, Plus, X, Trash2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '../ui/carousel';
import { InlineWheel } from './InlineWheel';

interface WorkoutCarouselProps {
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  visibleSets: any[];
  editingSetId: string | null;
  setEditingSetId: (id: string | null) => void;
  reps: number;
  setReps: (reps: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  handleLogSet: () => void;
  setShowEndExerciseConfirm: (show: boolean) => void;
  setSetToDeleteId: (id: string | null) => void;
  currentExercise: any;
  weightUnit: string;
  setWeightUnit: (unit: string) => void;
}

export function WorkoutCarousel(props: WorkoutCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedField, setSelectedField] = useState<'reps' | 'weight'>('reps');
  const [isLogSetPressed, setIsLogSetPressed] = useState(false);
  const slidesCount = Math.max(3, props.visibleSets.length + 2);

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      props.setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api, props.setCurrentSlide]);

  useEffect(() => {
    if (!api) return;
    if (api.selectedScrollSnap() !== props.currentSlide) {
      api.scrollTo(props.currentSlide);
    }
  }, [api, props.currentSlide]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          startIndex: props.currentSlide,
        }}
        className="w-full max-w-sm"
      >
        <CarouselContent className="items-center h-full">
          {/* Slide 0: End Exercise */}
          <CarouselItem className="basis-full flex justify-center">
            <div className="w-[300px] flex items-center justify-center p-6">
              <button
                onClick={() => props.setShowEndExerciseConfirm(true)}
                className="w-full aspect-square px-6 black-glass-button transition-all flex items-center justify-center"
              >
                <div className="display-font text-xl sm:text-2xl tracking-[0.3em] black-glass-text opacity-80 text-center">END EXERCISE</div>
              </button>
            </div>
          </CarouselItem>

          {/* Slide 1: Active Logging View */}
          <CarouselItem className="basis-full flex justify-center">
            <div className="w-[350px] flex flex-col items-center justify-center py-6 sm:py-10 gap-4">
              {props.editingSetId !== null && (
                <div className="label-font text-[10px] sm:text-xs text-primary mb-2 tracking-[0.2em] bevel-element px-3 py-1 bg-primary/10 rounded-full flex items-center gap-2">
                  <Edit2 size={12} /> EDITING SET
                  <button
                    onClick={() => {
                      props.setEditingSetId(null);
                      props.setReps(0);
                      props.setWeight(0);
                    }}
                    className="ml-2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="w-full flex items-stretch gap-4 px-2">
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <button
                    onClick={() => setSelectedField("reps")}
                    data-active={selectedField === "reps"}
                    className="w-full py-3 black-glass-button"
                  >
                    {props.reps > 0 ? (
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="display-font text-2xl black-glass-text">{props.reps}</span>
                        <span className="label-font text-[10px] black-glass-text tracking-widest">REPS</span>
                      </div>
                    ) : (
                      <div className="label-font text-xs black-glass-text tracking-widest">REPS</div>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedField("weight")}
                    data-active={selectedField === "weight"}
                    className="w-full py-3 black-glass-button"
                  >
                    {props.weight > 0 ? (
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="display-font text-2xl black-glass-text">{props.weight}</span>
                        <span className="label-font text-[10px] black-glass-text tracking-widest">{props.weightUnit}</span>
                      </div>
                    ) : (
                      <div className="label-font text-xs black-glass-text tracking-widest">WEIGHT</div>
                    )}
                  </button>

                  <button
                    onPointerDown={() => setIsLogSetPressed(true)}
                    onPointerUp={() => setIsLogSetPressed(false)}
                    onPointerLeave={() => setIsLogSetPressed(false)}
                    onClick={() => {
                      setTimeout(() => props.handleLogSet(), 50);
                    }}
                    disabled={props.reps === 0 || props.weight === 0}
                    data-active={isLogSetPressed}
                    className={`w-full py-3 black-glass-button relative ${props.editingSetId !== null ? 'text-orange-500' : 'text-primary-foreground'}`}
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      {props.editingSetId !== null ? <Edit2 size={16} /> : <Plus size={16} />}
                    </div>
                    <div className="label-font text-[10px] black-glass-text tracking-widest">
                      {props.editingSetId !== null ? 'SAVE EDIT' : 'LOG SET'}
                    </div>
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <InlineWheel
                    key={selectedField}
                    value={
                      selectedField === "reps"
                        ? (props.reps > 0 ? props.reps : 10)
                        : (props.weight > 0 ? props.weight : 45)
                    }
                    onChange={selectedField === "reps" ? props.setReps : props.setWeight}
                    min={selectedField === "reps" ? 1 : 5}
                    max={selectedField === "reps" ? 50 : 500}
                    step={selectedField === "reps" ? 1 : 5}
                  />
                  {selectedField === "weight" && (
                    <div className="flex gap-1">
                      {["LB", "KG"].map((unit) => (
                        <button
                          key={unit}
                          onClick={() => props.setWeightUnit(unit)}
                          data-active={props.weightUnit === unit}
                          className="px-3 py-1 label-font text-[10px] rounded-md black-glass-button"
                        >
                          <span className="black-glass-text">{unit}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Slide 2+: Previous Sets */}
          {[...props.visibleSets].reverse().map((set, arrayIndex) => {
            return (
              <CarouselItem key={set.id} className="basis-full flex justify-center">
                <div className="w-[350px] flex flex-col items-center justify-center py-8">
                  <div className="flex items-center justify-center gap-3 mb-5 sm:mb-8">
                    <div className="label-font text-sm text-muted-foreground">
                      SET {props.visibleSets.length - arrayIndex}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (props.currentExercise) {
                            props.setEditingSetId(set.id);
                            props.setReps(set.reps);
                            props.setWeight(set.weight);
                            props.setCurrentSlide(1); // Auto scroll to active slide
                          }
                        }}
                        className="black-glass-button transition-all p-2 rounded-md"
                      >
                        <Edit2 size={16} className="black-glass-text opacity-70" />
                      </button>
                      <button
                        onClick={() => {
                          if (props.currentExercise) {
                            props.setSetToDeleteId(set.id);
                          }
                        }}
                        className="black-glass-button-destructive transition-all p-2 rounded-md"
                      >
                        <Trash2 size={16} className="black-glass-text" />
                      </button>
                    </div>
                  </div>

                  <div className="flex w-full items-end justify-center gap-6">
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="display-font text-7xl leading-none bevel-text-large mb-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                        {set.reps}
                      </div>
                      <div className="label-font text-xs text-muted-foreground">REPS</div>
                    </div>
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="display-font text-7xl leading-none bevel-text-large mb-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                        {set.weight}
                      </div>
                      <div className="label-font text-xs text-muted-foreground">{props.weightUnit}</div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Slide Indicators */}
      <div className="flex items-center justify-center gap-0 pb-4">
        {Array.from({ length: slidesCount }).map((_, index) => {
          const isActive = index === props.currentSlide;
          // Only render dots for actual slides
          if (index > props.visibleSets.length + 1) return null;

          return (
            <div key={index} className="py-2 px-2 cursor-pointer" onClick={() => props.setCurrentSlide(index)}>
              <div
                className={`h-2 rounded-full transition-all duration-200 mx-auto ${isActive ? "w-6 bg-primary shadow-[0_0_12px_rgba(255,255,255,0.3)]" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
