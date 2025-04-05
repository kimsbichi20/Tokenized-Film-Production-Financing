import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClarity } from './mock-clarity';

// Mock the Clarity environment
const clarity = mockClarity();

describe('Production Milestone Contract', () => {
  beforeEach(() => {
    // Reset contract state
    clarity.reset();
  });
  
  it('should add a milestone to a project', () => {
    const result = clarity.callPublic('production-milestone', 'add-milestone', [
      'uint:1',  // project-id
      'string-utf8:Pre-production completed',  // description
      'uint:200000'  // funds-allocated
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(1); // First milestone ID
  });
});
