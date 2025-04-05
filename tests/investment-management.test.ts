import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClarity } from './mock-clarity';

// Mock the Clarity environment
const clarity = mockClarity();

describe('Investment Management Contract', () => {
  beforeEach(() => {
    // Reset contract state
    clarity.reset();
  });
  
  it('should allow investment in a project', () => {
    const result = clarity.callPublic('investment-management', 'invest', [
      'uint:1',  // project-id
      'uint:100000'  // amount
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(10000); // 100% ownership in basis points
  });
});
