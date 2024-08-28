type Game = import('./src/Game').default;
type CTX = CanvasRenderingContext2D;

declare function loaded(): void;
declare function menuBack(): void;

type Bosses =
  | import('./src/bosses/Boss').default
  | import('./src/bosses/CyberDragon').default
  | import('./src/bosses/BiomechLeviathan').default
  | import('./src/bosses/TemporalSerpent').default;
