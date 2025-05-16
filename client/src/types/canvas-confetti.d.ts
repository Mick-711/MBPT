declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    colors?: string[];
    disableForReducedMotion?: boolean;
    useWorker?: boolean;
  }

  type ConfettiFunction = (options?: ConfettiOptions) => Promise<null>;

  interface ConfettiCanvas {
    (options?: ConfettiOptions): Promise<null>;
    reset: () => void;
    create: (width: number, height: number, options?: ConfettiOptions) => ConfettiCanvas;
  }

  const confetti: ConfettiFunction & {
    reset: () => void;
    create: (width: number, height: number, options?: ConfettiOptions) => ConfettiCanvas;
  };

  export default confetti;
}