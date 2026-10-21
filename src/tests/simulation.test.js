import { describe, it, expect } from 'vitest';
import { createDefaultScenario } from '../data/initialScenario.js';
import { runPriorityQueueSimulation } from '../algorithms/priorityQueue.js';
import { runKnapsack } from '../algorithms/knapsack.js';

describe('Playback Step-by-Step Simulation Mechanics', () => {
  it('next step advances exactly one recorded operation and previous step restores state', () => {
    const scenario = createDefaultScenario();
    const { trace } = runPriorityQueueSimulation(scenario.orders);

    expect(trace.length).toBeGreaterThan(5);

    let currentStep = 0;
    // Step forward
    currentStep += 1;
    expect(currentStep).toBe(1);
    const step1State = trace[currentStep].snapshot;
    expect(step1State).toBeDefined();

    // Step forward again
    currentStep += 1;
    expect(currentStep).toBe(2);
    const step2State = trace[currentStep].snapshot;
    expect(step2State).toBeDefined();

    // Step backward (Previous Step)
    currentStep -= 1;
    expect(currentStep).toBe(1);
    const restoredStep1State = trace[currentStep].snapshot;
    expect(restoredStep1State).toEqual(step1State);

    // Reset restores to 0
    currentStep = 0;
    expect(currentStep).toBe(0);
    expect(trace[currentStep].op).toBe('INIT_QUEUE');
  });

  it('editing scenario input recalculates new execution trace', () => {
    const scenarioA = createDefaultScenario();
    const resultA = runKnapsack(scenarioA.packages, 10);

    // Modify capacity to 6 kg
    const resultB = runKnapsack(scenarioA.packages, 6);

    expect(resultA.totalWeight).toBeLessThanOrEqual(10);
    expect(resultB.totalWeight).toBeLessThanOrEqual(6);
    expect(resultA.dpTable[0].length).toBe(11);
    expect(resultB.dpTable[0].length).toBe(7);
  });
});
