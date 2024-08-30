type Game = import('./src/Game').default;
type CTX = CanvasRenderingContext2D;

declare function loaded(): void;
declare function menuBack(): void;
declare function updateMenuText(usingGamepad: boolean): void;

type Enemies =
  | import('./src/enemies/BasicEnemies').RegularEnemy
  | import('./src/enemies/BasicEnemies').TankEnemy
  | import('./src/enemies/BasicEnemies').StealthEnemy;

type Bosses = import('./src/bosses/Boss').default | import('./src/bosses/BiomechLeviathan').default;
/*| import('./src/bosses/CyberDragon').default
  | import('./src/bosses/TemporalSerpent').default;*/

interface GamepadHapticActuator {
  effects?: string[];
}

interface Gamepad {
  vibrationActuator: GamepadHapticActuator;
}

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface Performance {
  memory?: PerformanceMemory;
}

type Direction = 'up' | 'down' | 'left' | 'right';

type CheatCode = {
  code: string[];
  index: number;
  enabled: boolean;
};
