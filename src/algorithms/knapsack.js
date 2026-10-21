/**
 * RouteX — Algorithm 6: 0/1 Knapsack Using Dynamic Programming
 * Optimal package selection maximizing cargo value within vehicle payload capacity limit.
 *
 * Recurrence:
 * dp[i][w] = dp[i-1][w]                                      if weight[i] > w
 * dp[i][w] = max( dp[i-1][w], dp[i-1][w - weight[i]] + val[i] )  otherwise
 */

export const KNAPSACK_METADATA = {
  id: 'knapsack-01',
  name: '0/1 Knapsack (Dynamic Programming)',
  category: 'Dynamic Programming',
  timeComplexity: {
    worst: 'O(N · W)',
    pseudoPolynomial: 'O(N · W) where W is integer capacity',
  },
  spaceComplexity: 'O(N · W) for full DP memoization table and backtracking',
  assumptions: 'Integral non-negative weights and values. Each package item can be included at most once (0 or 1).',
};

/**
 * Runs 0/1 Knapsack DP algorithm, filling the table cell-by-cell and tracing backtracking.
 */
export function runKnapsack(packages, capacity = 10) {
  const n = packages.length;
  const W = Math.floor(capacity);

  // Initialize DP table of size (n + 1) x (W + 1) with zeros
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0)); // [TAG: INIT_DP_TABLE]
  const decisions = Array.from({ length: n + 1 }, () => Array(W + 1).fill('INIT'));

  const trace = [];

  const getSnapshot = (currI = null, currW = null, isBacktracking = false, selectedItems = []) => ({
    dp: JSON.parse(JSON.stringify(dp)),
    decisions: JSON.parse(JSON.stringify(decisions)),
    currI,
    currW,
    isBacktracking,
    selectedItems: [...selectedItems],
    capacity: W,
    packages,
  });

  trace.push({
    op: 'INIT',
    codeTag: 'INIT_DP_TABLE',
    title: `Initialize Knapsack DP Table (${n} Items × ${W} kg)`,
    currI: 0,
    currW: 0,
    item: null,
    dpSnapshot: dp,
    comparisons: [
      `Total Packages: ${n} items`,
      `Vehicle Payload Capacity: ${W} kg`,
      `Base Case: dp[0][w] = 0 (0 items) and dp[i][0] = 0 (0 capacity)`,
    ],
    calculations: `Table dimensions: ${n + 1} rows × ${W + 1} columns = ${(n + 1) * (W + 1)} cells`,
    decision: 'Base rows initialized to 0. Begin row-by-row dynamic programming evaluation.',
    whatChanges: 'DP table allocated and base cases zeroed.',
    whatNext: `Begin evaluating Package 1 ("${packages[0]?.name}").`,
    snapshot: getSnapshot(0, 0),
  });

  // Fill DP Table
  for (let i = 1; i <= n; i++) { // [TAG: LOOP_ITEMS]
    const item = packages[i - 1];
    const itemWeight = Math.floor(item.weight);
    const itemValue = item.value;

    for (let w = 1; w <= W; w++) { // [TAG: LOOP_CAPACITY]
      const excludeVal = dp[i - 1][w];

      if (itemWeight > w) { // [TAG: CANNOT_INCLUDE]
        // Item too heavy for current sub-capacity
        dp[i][w] = excludeVal;
        decisions[i][w] = 'EXCLUDE_TOO_HEAVY';

        trace.push({
          op: 'CELL_TOO_HEAVY',
          codeTag: 'CANNOT_INCLUDE',
          title: `dp[${i}][${w}]: "${item.name}" Exceeds Capacity (${itemWeight} kg > ${w} kg)`,
          currI: i,
          currW: w,
          item,
          excludeVal,
          includeVal: null,
          chosenVal: excludeVal,
          comparisons: [
            `Package Weight: ${itemWeight} kg`,
            `Sub-capacity: ${w} kg`,
            `Exclusion Value: dp[${i - 1}][${w}] = $${excludeVal}`,
          ],
          calculations: `${itemWeight} kg > ${w} kg → Cannot fit package. Inherit best value without this package.`,
          decision: `Exclude "${item.id}". dp[${i}][${w}] = $${excludeVal}.`,
          whatChanges: `dp[${i}][${w}] = ${excludeVal}`,
          whatNext: w < W ? `Move to capacity w = ${w + 1} kg.` : `Proceed to next package row.`,
          snapshot: getSnapshot(i, w),
        });
      } else {
        // Can fit: compare exclude vs include
        const includeVal = dp[i - 1][w - itemWeight] + itemValue; // [TAG: COMPARE_OPTIONS]
        const includesItem = includeVal > excludeVal;
        dp[i][w] = Math.max(excludeVal, includeVal); // [TAG: SET_MAX_CELL]
        decisions[i][w] = includesItem ? 'INCLUDE' : 'EXCLUDE';

        trace.push({
          op: includesItem ? 'CELL_INCLUDE' : 'CELL_EXCLUDE',
          codeTag: includesItem ? 'SET_MAX_CELL' : 'COMPARE_OPTIONS',
          title: includesItem
            ? `dp[${i}][${w}]: Include "${item.name}" ($${dp[i][w]})`
            : `dp[${i}][${w}]: Exclude "${item.name}" (Keep $${dp[i][w]})`,
          currI: i,
          currW: w,
          item,
          excludeVal,
          includeVal,
          chosenVal: dp[i][w],
          comparisons: [
            `Exclude Option: dp[${i - 1}][${w}] = $${excludeVal}`,
            `Include Option: dp[${i - 1}][${w - itemWeight}] ($${dp[i - 1][w - itemWeight]}) + $${itemValue} = $${includeVal}`,
          ],
          calculations: includesItem
            ? `Include ($${includeVal}) > Exclude ($${excludeVal}) → Gain +$${includeVal - excludeVal}`
            : `Exclude ($${excludeVal}) ≥ Include ($${includeVal}) → No value gain from including`,
          decision: includesItem
            ? `INCLUDE "${item.id}": Set dp[${i}][${w}] = $${includeVal}.`
            : `EXCLUDE "${item.id}": Retain previous best value dp[${i}][${w}] = $${excludeVal}.`,
          whatChanges: `dp[${i}][${w}] = ${dp[i][w]}`,
          whatNext: w < W ? `Move to capacity w = ${w + 1} kg.` : `Finish row for item ${i}.`,
          snapshot: getSnapshot(i, w),
        });
      }
    }
  }

  // Backtracking Phase to reconstruct optimal package set
  const selectedPackages = []; // [TAG: BACKTRACK_START]
  let currentCap = W;

  trace.push({
    op: 'BACKTRACK_START',
    codeTag: 'BACKTRACK_START',
    title: `Begin Backtracking from dp[${n}][${W}] ($${dp[n][W]})`,
    currI: n,
    currW: W,
    item: null,
    comparisons: [`Optimal Total Value Found: $${dp[n][W]}`],
    calculations: `Backtrack from bottom-right cell dp[${n}][${W}] to identify chosen packages.`,
    decision: 'Inspect row by row: If dp[i][w] ≠ dp[i-1][w], package i was selected.',
    whatChanges: 'Entering backtracking reconstruction phase.',
    whatNext: `Inspect Package ${n} ("${packages[n - 1]?.name}").`,
    snapshot: getSnapshot(n, W, true, []),
  });

  for (let i = n; i > 0; i--) { // [TAG: BACKTRACK_STEP]
    const item = packages[i - 1];
    const itemWeight = Math.floor(item.weight);

    if (dp[i][currentCap] !== dp[i - 1][currentCap]) { // [TAG: BACKTRACK_DECISION]
      // Item was included!
      selectedPackages.unshift(item);
      const prevCap = currentCap;
      currentCap -= itemWeight;

      trace.push({
        op: 'BACKTRACK_ITEM_SELECTED',
        codeTag: 'BACKTRACK_DECISION',
        title: `Package "${item.name}" WAS SELECTED (+$${item.value})`,
        currI: i,
        currW: prevCap,
        item,
        comparisons: [
          `dp[${i}][${prevCap}] ($${dp[i][prevCap]}) ≠ dp[${i - 1}][${prevCap}] ($${dp[i - 1][prevCap]})`,
          `Package Payload: ${itemWeight} kg | Value: $${item.value}`,
        ],
        calculations: `Remaining capacity moves from ${prevCap} kg - ${itemWeight} kg = ${currentCap} kg`,
        decision: `CONFIRMED: "${item.id}" is in the optimal knapsack set.`,
        whatChanges: `selectedPackages.unshift("${item.id}")`,
        whatNext: currentCap > 0 && i > 1 ? `Examine preceding item with capacity ${currentCap} kg.` : 'Backtracking finishing.',
        snapshot: getSnapshot(i, prevCap, true, selectedPackages),
      });
    } else {
      trace.push({
        op: 'BACKTRACK_ITEM_NOT_SELECTED',
        codeTag: 'BACKTRACK_DECISION',
        title: `Package "${item.name}" was NOT selected`,
        currI: i,
        currW: currentCap,
        item,
        comparisons: [`dp[${i}][${currentCap}] ($${dp[i][currentCap]}) === dp[${i - 1}][${currentCap}] ($${dp[i - 1][currentCap]})`],
        calculations: `Value was identical without package "${item.id}".`,
        decision: `"${item.id}" was excluded in the optimal solution.`,
        whatChanges: 'No capacity deduction.',
        whatNext: i > 1 ? `Examine preceding item at capacity ${currentCap} kg.` : 'Backtracking complete.',
        snapshot: getSnapshot(i, currentCap, true, selectedPackages),
      });
    }
  }

  const totalSelectedWeight = selectedPackages.reduce((sum, p) => sum + p.weight, 0);
  const totalSelectedValue = selectedPackages.reduce((sum, p) => sum + p.value, 0);

  trace.push({
    op: 'KNAPSACK_COMPLETE',
    codeTag: 'BACKTRACK_START',
    title: `0/1 Knapsack Solved — Optimal Value: $${totalSelectedValue}`,
    currI: 0,
    currW: currentCap,
    item: null,
    selectedPackages,
    totalWeight: totalSelectedWeight,
    totalValue: totalSelectedValue,
    comparisons: [
      `Selected Packages: ${selectedPackages.map(p => p.id).join(', ')}`,
      `Total Weight: ${totalSelectedWeight} kg / ${W} kg capacity (${Math.round((totalSelectedWeight / W) * 100)}% utilized)`,
      `Total Cargo Value: $${totalSelectedValue}`,
    ],
    calculations: `Proved globally optimal by Bellman optimality principle of Dynamic Programming.`,
    decision: 'Cargo manifest finalized for dispatch vehicle loading.',
    whatChanges: 'Solution finalized.',
    whatNext: 'Ready for loading or scenario parameter updates.',
    snapshot: getSnapshot(0, 0, true, selectedPackages),
  });

  return {
    trace,
    dpTable: dp,
    selectedPackages,
    totalWeight: totalSelectedWeight,
    totalValue: totalSelectedValue,
  };
}
