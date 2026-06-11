import { FlowDefinition } from '../schemas';

export function topologicalLevels(flow: FlowDefinition): string[][] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  for (const node of flow.nodes) {
    inDegree.set(node.instance_id, 0);
    adjacency.set(node.instance_id, new Set());
  }

  for (const conn of flow.connections) {
    const fromId = conn.from.node;
    const toId = conn.to.node;

    if (!adjacency.get(fromId)!.has(toId)) {
      adjacency.get(fromId)!.add(toId);
      const currentDegree = inDegree.get(toId) || 0;
      inDegree.set(toId, currentDegree + 1);
    }
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  const levels: string[][] = [];
  let processed = 0;

  while (queue.length > 0) {
    const currentLevel = [...queue];
    levels.push(currentLevel);
    processed += currentLevel.length;

    const nextQueue: string[] = [];
    for (const nodeId of currentLevel) {
      for (const successor of adjacency.get(nodeId)!) {
        const newDegree = inDegree.get(successor)! - 1;
        inDegree.set(successor, newDegree);

        if (newDegree === 0) {
          nextQueue.push(successor);
        }
      }
    }

    queue.length = 0;
    queue.push(...nextQueue);
  }

  if (processed !== flow.nodes.length) {
    throw new Error('CICLO_DETECTADO');
  }

  return levels;
}

export function hasCycle(flow: FlowDefinition): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const adj = new Map<string, Set<string>>();
  for (const node of flow.nodes) {
    adj.set(node.instance_id, new Set());
  }
  for (const conn of flow.connections) {
    if (!adj.get(conn.from.node)!.has(conn.to.node)) {
      adj.get(conn.from.node)!.add(conn.to.node);
    }
  }

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    for (const neighbor of adj.get(nodeId) || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const nodeId of flow.nodes.map((n) => n.instance_id)) {
    if (!visited.has(nodeId)) {
      if (dfs(nodeId)) return true;
    }
  }

  return false;
}
