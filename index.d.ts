type Game = import('./src/Game').default;
type CTX = CanvasRenderingContext2D;

declare function loaded(): void;
declare function menuBack(): void;
declare function updateMenuText(usingGamepad: boolean): void;

type Bosses =
  | import('./src/bosses/Boss').default
  | import('./src/bosses/CyberDragon').default
  | import('./src/bosses/BiomechLeviathan').default
  | import('./src/bosses/TemporalSerpent').default;

interface GamepadHapticActuator {
  effects?: string[];
}

interface Gamepad {
  vibrationActuator: GamepadHapticActuator;
}
