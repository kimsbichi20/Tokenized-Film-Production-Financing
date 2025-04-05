import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClarity } from './mock-clarity';

// Mock the Clarity environment
const clarity = mockClarity();

describe('Revenue Distribution Contract', () => {
  beforeEach(() => {
    // Reset contract state
    clarity.reset();
  });
  
  it('should complete a distribution', () => {
    // Record revenue
    clarity.callPublic('revenue-distribution', 'record-revenue', [
      'uint:1',  // project-id
      'uint:500000'  // amount
    ]);
    
    // Create a distribution
    clarity.callPublic('revenue-distribution', 'create-distribution', [
      'uint:1',  // project-id
      'uint:300000'  // amount
    ]);
    
    // Complete the distribution
    const result = clarity.callPublic('revenue-distribution', 'complete-distribution', [
      'uint:1',  // project-id
      'uint:1'   // distribution-id
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
    
    // Check distribution details
    const distribution = clarity.callReadOnly('revenue-distribution', 'get-distribution', [
      'uint:1',  // project-id
      'uint:1'   // distribution-id
    ]);
    
    expect(distribution.success).toBe(true);
    expect(distribution.value.amount).toBe(300000);
    expect(distribution.value.completed).toBe(true);
  });
  
  it('should calculate available revenue correctly', () => {
    // Record revenue
    clarity.callPublic('revenue-distribution', 'record-revenue', [
      'uint:1',  // project-id
      'uint:500000'  // amount
    ]);
    
    // Create a distribution
    clarity.callPublic('revenue-distribution', 'create-distribution', [
      'uint:1',  // project-id
      'uint:300000'  // amount
    ]);
    
    // Check available revenue
    const availableRevenue = clarity.callReadOnly('revenue-distribution', 'get-available-revenue', [
      'uint:1'  // project-id
    ]);
    
    expect(availableRevenue.success).toBe(true);
    expect(availableRevenue.value).toBe(200000); // 500,000 - 300,000
  });
});
