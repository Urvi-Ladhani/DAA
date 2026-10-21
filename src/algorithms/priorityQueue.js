/**
 * RouteX — Algorithm 1: Priority Queue Using a Binary Heap
 * Real binary min-heap implementation for deterministic logistics order scheduling.
 *
 * Scheduling Policy:
 * 1. Higher priority first (Critical > High > Medium > Low)
 * 2. Earlier deadline for equal priorities (e.g. 15 min < 20 min)
 * 3. Lexicographical Order ID as final tie-breaker (e.g. "RX-101" < "RX-102")
 */

import { PRIORITY_RANKS } from '../data/demoOrders.js';

export const PRIORITY_QUEUE_METADATA = {
  id: 'priority-queue',
  name: 'Priority Queue (Binary Heap)',
  category: 'Greedy / Heap Structures',
  timeComplexity: {
    insert: 'O(log N)',
    extractMin: 'O(log N)',
    peek: 'O(1)',
    buildHeap: 'O(N)',
  },
  spaceComplexity: 'O(N)',
  assumptions: 'Fixed binary tree represented as a contiguous 0-indexed array with deterministic 3-tier tie-breaking.',
};

/**
 * Deterministic order comparator.
 * Returns negative if orderA has higher dispatch precedence than orderB.
 */
export function compareOrders(orderA, orderB) { // [TAG: COMPARE_ORDERS]
  if (!orderA || !orderB) return 0;

  const rankA = PRIORITY_RANKS[orderA.priority] ?? 99;
  const rankB = PRIORITY_RANKS[orderB.priority] ?? 99;

  // Rule 1: Priority comparison (Critical=1, High=2, Medium=3, Low=4)
  if (rankA !== rankB) {
    return rankA - rankB; // Lower rank number = higher precedence
  }

  // Rule 2: Earlier deadline (fewer minutes remaining)
  if (orderA.deadline !== orderB.deadline) {
    return orderA.deadline - orderB.deadline;
  }

  // Rule 3: Tie-breaker by Order ID
  return String(orderA.id).localeCompare(String(orderB.id));
}

/**
 * Binary Heap Class with execution trace emission for step-by-step playback.
 */
export class TraceableBinaryHeap {
  constructor() {
    this.heap = [];
    this.extracted = [];
  }

  getSnapshot() {
    return {
      heap: JSON.parse(JSON.stringify(this.heap)),
      extracted: JSON.parse(JSON.stringify(this.extracted)),
    };
  }

  /**
   * Sift-up operation to restore min-heap property after insertion.
   */
  siftUp(startIndex, trace) { // [TAG: SIFT_UP_START]
    let currentIdx = startIndex;

    while (currentIdx > 0) {
      const parentIdx = Math.floor((currentIdx - 1) / 2);
      const currentOrder = this.heap[currentIdx];
      const parentOrder = this.heap[parentIdx];

      const comp = compareOrders(currentOrder, parentOrder); // [TAG: SIFT_UP_COMPARE]

      trace.push({
        op: 'SIFT_UP_COMPARE',
        codeTag: 'SIFT_UP_COMPARE',
        title: `Compare Child [${currentIdx}] with Parent [${parentIdx}]`,
        indices: { current: currentIdx, parent: parentIdx },
        comparing: { child: currentOrder, parent: parentOrder },
        comparisons: [
          `Priority: Child ${currentOrder.id} (${currentOrder.priority}) vs Parent ${parentOrder.id} (${parentOrder.priority})`,
          `Deadline: Child (${currentOrder.deadline}m) vs Parent (${parentOrder.deadline}m)`,
        ],
        calculations: `compareOrders("${currentOrder.id}", "${parentOrder.id}") = ${comp}`,
        decision: comp < 0
          ? `Child "${currentOrder.id}" has higher scheduling precedence than Parent "${parentOrder.id}". SWAP required.`
          : `Parent "${parentOrder.id}" already has higher or equal precedence. Min-heap property satisfied.`,
        whatChanges: comp < 0 ? `Indices [${currentIdx}] and [${parentIdx}] will swap.` : 'No swap needed.',
        whatNext: comp < 0 ? `Swap and continue sifting up from index [${parentIdx}].` : 'Sift-up complete.',
        snapshot: this.getSnapshot(),
      });

      if (comp < 0) {
        // Swap child and parent
        [this.heap[currentIdx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[currentIdx]]; // [TAG: SIFT_UP_SWAP]

        trace.push({
          op: 'SIFT_UP_SWAP',
          codeTag: 'SIFT_UP_SWAP',
          title: `Swapped Child [${currentIdx}] ↔ Parent [${parentIdx}]`,
          indices: { current: parentIdx, prev: currentIdx },
          comparing: { moved: currentOrder, displaced: parentOrder },
          comparisons: [`Order "${currentOrder.id}" promoted to index ${parentIdx}.`],
          calculations: `Heap updated at indices ${currentIdx} and ${parentIdx}`,
          decision: `Order "${currentOrder.id}" moves up the tree toward root.`,
          whatChanges: `Array indices ${currentIdx} and ${parentIdx} exchanged.`,
          whatNext: parentIdx > 0 ? `Compare new position [${parentIdx}] with its parent.` : 'Reached root (index 0).',
          snapshot: this.getSnapshot(),
        });

        currentIdx = parentIdx;
      } else {
        break;
      }
    }

    trace.push({
      op: 'HEAP_PROPERTY_RESTORED',
      codeTag: 'HEAP_PROPERTY_RESTORED',
      title: 'Heap Invariant Restored',
      indices: { current: currentIdx },
      comparing: null,
      comparisons: ['Every parent node has higher or equal dispatch precedence than its children.'],
      calculations: `Valid min-heap with size ${this.heap.length}`,
      decision: 'Heap structure is balanced and satisfies the scheduling policy.',
      whatChanges: 'Subtree invariants verified.',
      whatNext: 'Ready for next order insertion or dispatch extraction.',
      snapshot: this.getSnapshot(),
    });
  }

  /**
   * Insert a new order into the heap.
   */
  insert(order, trace) { // [TAG: INSERT_ORDER]
    this.heap.push(order);
    const newIdx = this.heap.length - 1;

    trace.push({
      op: 'INSERT_APPEND',
      codeTag: 'INSERT_ORDER',
      title: `Append Order "${order.id}" to Leaf [${newIdx}]`,
      indices: { current: newIdx },
      order,
      comparisons: [`Priority: ${order.priority}, Deadline: ${order.deadline} min, Weight: ${order.weight} kg`],
      calculations: `Array length increased to ${this.heap.length}; new leaf placed at index ${newIdx}`,
      decision: `Order "${order.id}" placed at the lowest-rightmost leaf of the binary tree.`,
      whatChanges: `heap[${newIdx}] = ${order.id}`,
      whatNext: newIdx > 0 ? `Begin sift-up from index ${newIdx} to restore heap order.` : 'Single element; root is set.',
      snapshot: this.getSnapshot(),
    });

    if (newIdx > 0) {
      this.siftUp(newIdx, trace);
    }
  }

  /**
   * Sift-down operation after root extraction.
   */
  siftDown(startIndex, trace) { // [TAG: SIFT_DOWN_START]
    let currentIdx = startIndex;
    const length = this.heap.length;

    while (true) {
      let smallestIdx = currentIdx;
      const leftChildIdx = 2 * currentIdx + 1;
      const rightChildIdx = 2 * currentIdx + 2;

      // Check left child
      if (leftChildIdx < length) { // [TAG: SIFT_DOWN_COMPARE_LEFT]
        const leftComp = compareOrders(this.heap[leftChildIdx], this.heap[smallestIdx]);
        if (leftComp < 0) {
          smallestIdx = leftChildIdx;
        }
      }

      // Check right child
      if (rightChildIdx < length) { // [TAG: SIFT_DOWN_COMPARE_RIGHT]
        const rightComp = compareOrders(this.heap[rightChildIdx], this.heap[smallestIdx]);
        if (rightComp < 0) {
          smallestIdx = rightChildIdx;
        }
      }

      if (smallestIdx !== currentIdx) {
        const currentOrder = this.heap[currentIdx];
        const targetOrder = this.heap[smallestIdx];

        trace.push({
          op: 'SIFT_DOWN_COMPARE',
          codeTag: 'SIFT_DOWN_COMPARE_LEFT',
          title: `Sift-Down: Compare Node [${currentIdx}] with Children`,
          indices: { current: currentIdx, target: smallestIdx, left: leftChildIdx, right: rightChildIdx },
          comparing: { current: currentOrder, highestChild: targetOrder },
          comparisons: [
            `Left Child [${leftChildIdx}]: ${this.heap[leftChildIdx]?.id || 'None'}`,
            `Right Child [${rightChildIdx}]: ${this.heap[rightChildIdx]?.id || 'None'}`,
          ],
          calculations: `Child at index [${smallestIdx}] ("${targetOrder.id}") has higher dispatch precedence.`,
          decision: `Swap Node [${currentIdx}] with Child [${smallestIdx}] to restore min-heap invariant.`,
          whatChanges: `Will swap heap[${currentIdx}] ("${currentOrder.id}") with heap[${smallestIdx}] ("${targetOrder.id}").`,
          whatNext: `Perform swap and continue sift-down from index [${smallestIdx}].`,
          snapshot: this.getSnapshot(),
        });

        // Swap
        [this.heap[currentIdx], this.heap[smallestIdx]] = [this.heap[smallestIdx], this.heap[currentIdx]]; // [TAG: SIFT_DOWN_SWAP]

        trace.push({
          op: 'SIFT_DOWN_SWAP',
          codeTag: 'SIFT_DOWN_SWAP',
          title: `Swapped Parent [${currentIdx}] ↔ Child [${smallestIdx}]`,
          indices: { current: smallestIdx, prev: currentIdx },
          comparing: { movedDown: currentOrder, movedUp: targetOrder },
          comparisons: [`Order "${targetOrder.id}" promoted to index ${currentIdx}.`],
          calculations: `Heap array swapped at indices ${currentIdx} and ${smallestIdx}`,
          decision: `Demote "${currentOrder.id}" to index ${smallestIdx}.`,
          whatChanges: `Node [${currentIdx}] is now "${targetOrder.id}"; Node [${smallestIdx}] is now "${currentOrder.id}".`,
          whatNext: `Check children of new position [${smallestIdx}].`,
          snapshot: this.getSnapshot(),
        });

        currentIdx = smallestIdx;
      } else {
        trace.push({
          op: 'SIFT_DOWN_RESTORED',
          codeTag: 'HEAP_PROPERTY_RESTORED',
          title: 'Sift-Down Complete — Heap Restored',
          indices: { current: currentIdx },
          comparing: null,
          comparisons: ['Current node has higher or equal precedence than all children.'],
          calculations: `Heap invariant verified at index ${currentIdx}.`,
          decision: 'Heap property is fully restored.',
          whatChanges: 'No further swaps required.',
          whatNext: 'Ready for next queue operation.',
          snapshot: this.getSnapshot(),
        });
        break;
      }
    }
  }

  /**
   * Extract the highest priority order (root of min-heap).
   */
  extractMin(trace) { // [TAG: EXTRACT_MIN]
    if (this.heap.length === 0) return null;

    const rootOrder = this.heap[0];

    trace.push({
      op: 'EXTRACT_PEEK',
      codeTag: 'EXTRACT_MIN',
      title: `Dispatch Highest Priority Order "${rootOrder.id}"`,
      indices: { root: 0 },
      order: rootOrder,
      comparisons: [
        `Priority: ${rootOrder.priority} (Rank ${PRIORITY_RANKS[rootOrder.priority]})`,
        `Deadline: ${rootOrder.deadline} min`,
        `Destination: ${rootOrder.destination}`,
      ],
      calculations: `Root of min-heap possesses highest dispatch precedence across all ${this.heap.length} orders.`,
      decision: `Extract "${rootOrder.id}" for immediate vehicle assignment and dispatch.`,
      whatChanges: `Will remove root "${rootOrder.id}" and replace with last leaf.`,
      whatNext: this.heap.length > 1 ? 'Move last leaf to root, then sift-down.' : 'Queue will become empty.',
      snapshot: this.getSnapshot(),
    });

    if (this.heap.length === 1) {
      const extracted = this.heap.pop();
      this.extracted.push(extracted);

      trace.push({
        op: 'EXTRACT_COMPLETE',
        codeTag: 'EXTRACT_MIN',
        title: `Queue Empty — Last Order "${extracted.id}" Dispatched`,
        indices: null,
        order: extracted,
        comparisons: [],
        calculations: 'Heap size = 0',
        decision: 'Final order successfully extracted from queue.',
        whatChanges: 'Heap is now empty.',
        whatNext: 'All orders processed.',
        snapshot: this.getSnapshot(),
      });
      return extracted;
    }

    // Move last element to root
    const lastOrder = this.heap.pop();
    this.heap[0] = lastOrder;
    this.extracted.push(rootOrder);

    trace.push({
      op: 'EXTRACT_REPLACE_ROOT',
      codeTag: 'EXTRACT_MIN',
      title: `Moved Last Leaf "${lastOrder.id}" to Root [0]`,
      indices: { root: 0 },
      order: lastOrder,
      comparisons: [`Displaced extracted root "${rootOrder.id}" -> moved to Extracted Orders list.`],
      calculations: `Heap length reduced to ${this.heap.length}`,
      decision: `Leaf "${lastOrder.id}" temporarily occupies root position [0].`,
      whatChanges: `heap[0] = "${lastOrder.id}". Root now violates heap property and requires sift-down.`,
      whatNext: 'Begin sift-down from root [0] to restore min-heap invariant.',
      snapshot: this.getSnapshot(),
    });

    this.siftDown(0, trace);
    return rootOrder;
  }
}

/**
 * Runs the full Priority Queue simulation on the demo orders.
 * Emits complete execution trace for step-by-step playback.
 */
export function runPriorityQueueSimulation(orders) {
  const heapInstance = new TraceableBinaryHeap();
  const trace = [];

  trace.push({
    op: 'INIT_QUEUE',
    codeTag: 'COMPARE_ORDERS',
    title: 'Initialize Priority Queue Simulation',
    indices: null,
    comparing: null,
    comparisons: [`Total Incoming Orders: ${orders.length}`],
    calculations: 'Empty Binary Heap initialized; scheduling policy loaded (Priority > Deadline > ID)',
    decision: 'Begin sequential insertion of demo orders into the binary heap.',
    whatChanges: 'Heap initialized: []',
    whatNext: `Insert first order: "${orders[0]?.id}".`,
    snapshot: heapInstance.getSnapshot(),
  });

  // 1. Insert all demo orders into heap
  for (const order of orders) {
    heapInstance.insert(order, trace);
  }

  // 2. Extract top orders to show deterministic dispatch sequence
  trace.push({
    op: 'DISPATCH_PHASE_START',
    codeTag: 'EXTRACT_MIN',
    title: 'Begin Priority Order Dispatch Phase',
    indices: { root: 0 },
    order: heapInstance.heap[0],
    comparisons: ['All 5 orders are structured in the binary heap.'],
    calculations: `Top order at root: "${heapInstance.heap[0]?.id}" (${heapInstance.heap[0]?.priority}, ${heapInstance.heap[0]?.deadline}m)`,
    decision: 'Demonstrate extraction of highest-precedence orders according to scheduling policy.',
    whatChanges: 'Transitioning from insertion phase to extraction phase.',
    whatNext: 'Extract root order and restore heap.',
    snapshot: heapInstance.getSnapshot(),
  });

  // Extract first 2 highest priority orders to demonstrate siftDown in action
  heapInstance.extractMin(trace);
  heapInstance.extractMin(trace);

  return {
    trace,
    finalHeap: heapInstance.heap,
    extractedOrders: heapInstance.extracted,
  };
}
