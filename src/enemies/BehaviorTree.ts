import { Enemy } from './BasicEnemies';

export class BehaviorTree {
  rootNode: Node;

  constructor(rootNode: Node) {
    this.rootNode = rootNode;
  }

  tick(enemy: Enemy, deltaTime: number): void {
    this.rootNode.execute(enemy, deltaTime);
  }
}

export abstract class Node {
  abstract execute(enemy: Enemy, deltaTime: number): boolean;
}

export class SequenceNode extends Node {
  children: Node[];

  constructor(children: Node[]) {
    super();
    this.children = children;
  }

  execute(enemy: Enemy, deltaTime: number): boolean {
    for (let child of this.children) {
      if (!child.execute(enemy, deltaTime)) {
        return false;
      }
    }
    return true;
  }
}

export class SelectorNode extends Node {
  children: Node[];

  constructor(children: Node[]) {
    super();
    this.children = children;
  }

  execute(enemy: Enemy, deltaTime: number): boolean {
    for (let child of this.children) {
      if (child.execute(enemy, deltaTime)) {
        return true;
      }
    }
    return false;
  }
}

export class ActionNode extends Node {
  action: (enemy: Enemy, deltaTime: number) => boolean;

  constructor(action: (enemy: Enemy, deltaTime: number) => boolean) {
    super();
    this.action = action;
  }

  execute(enemy: Enemy, deltaTime: number): boolean {
    return this.action(enemy, deltaTime);
  }
}
