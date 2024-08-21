class BehaviorTree {
  constructor(rootNode) {
      this.rootNode = rootNode;
  }

  tick(enemy, deltaTime) {
      this.rootNode.execute(enemy, deltaTime);
  }
}

class Node {
  execute(enemy, deltaTime) {
      throw new Error("execute method not implemented");
  }
}

class SequenceNode extends Node {
  constructor(children) {
      super();
      this.children = children;
  }

  execute(enemy, deltaTime) {
      for (let child of this.children) {
          if (!child.execute(enemy, deltaTime)) {
              return false;
          }
      }
      return true;
  }
}

class SelectorNode extends Node {
  constructor(children) {
      super();
      this.children = children;
  }

  execute(enemy, deltaTime) {
      for (let child of this.children) {
          if (child.execute(enemy, deltaTime)) {
              return true;
          }
      }
      return false;
  }
}

class ActionNode extends Node {
  constructor(action) {
      super();
      this.action = action;
  }

  execute(enemy, deltaTime) {
      return this.action(enemy, deltaTime);
  }
}

export { BehaviorTree, SequenceNode, SelectorNode, ActionNode };
