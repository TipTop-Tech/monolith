import React, { useEffect, useState } from 'react';
import { Edit2, Plus, X, Trash2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '../ui/carousel';

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
  setPickerType: (type: 'reps' | 'weight' | 'restTime' | null) => void;
  handleLogSet: () => void;
  setShowEndExerciseConfirm: (show: boolean) => void;
  setSetToDeleteId: (id: string | null) => void;
  currentExercise: any;
  weightUnit: string;
}

export function WorkoutCarousel(props: WorkoutCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [isRepsPressed, setIsRepsPressed] = useState(false);
  const [isWeightPressed, setIsWeightPressed] = useState(false);
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
            <div className="w-[350px] flex flex-col items-center justify-center py-6 sm:py-12 gap-4 sm:gap-6">
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

              <button
                onPointerDown={() => setIsRepsPressed(true)}
                onPointerUp={() => setIsRepsPressed(false)}
                onPointerLeave={() => setIsRepsPressed(false)}
                onClick={() => {
                  setTimeout(() => props.setPickerType("reps"), 50);
                }}
                data-active={isRepsPressed}
                className="w-3/4 py-3 sm:py-4 black-glass-button mb-2"
              >
                {props.reps > 0 ? (
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="display-font text-3xl black-glass-text">{props.reps}</span>
                    <span className="label-font text-xs black-glass-text tracking-widest">REPS</span>
                  </div>
                ) : (
                  <div className="label-font text-xs black-glass-text tracking-widest">REPS</div>
                )}
              </button>

              <button
                onPointerDown={() => setIsWeightPressed(true)}
                onPointerUp={() => setIsWeightPressed(false)}
                onPointerLeave={() => setIsWeightPressed(false)}
                onClick={() => {
                  setTimeout(() => props.setPickerType("weight"), 50);
                }}
                data-active={isWeightPressed}
                className="w-3/4 py-3 sm:py-4 black-glass-button"
              >
                {props.weight > 0 ? (
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="display-font text-3xl black-glass-text">{props.weight}</span>
                    <span className="label-font text-xs black-glass-text tracking-widest">{props.weightUnit}</span>
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
                className={`w-3/4 py-3 sm:py-4 black-glass-button relative ${props.editingSetId !== null ? 'text-orange-500' : 'text-primary-foreground'}`}
              >
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  {props.editingSetId !== null ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <div className="label-font text-xs black-glass-text tracking-widest">
                  {props.editingSetId !== null ? 'SAVE EDIT' : 'LOG SET'}
                </div>
              </button>
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
                      <div className="display-font text-7xl leading-none bevel-text-large mb-2">
                        {set.reps}
                      </div>
                      <div className="label-font text-xs text-muted-foreground">REPS</div>
                    </div>
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="display-font text-7xl leading-none bevel-text-large mb-2">
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
