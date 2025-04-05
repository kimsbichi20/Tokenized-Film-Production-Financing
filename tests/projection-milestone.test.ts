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
  
  it('should mark a milestone as completed', () => {
    // First add a milestone
    clarity.callPublic('production-milestone', 'add-milestone', [
      'uint:1',  // project-id
      'string-utf8:Pre-production completed',  // description
      'uint:200000'  // funds-allocated
    ]);
    
    // Then complete it
    const result = clarity.callPublic('production-milestone', 'complete-milestone', [
      'uint:1',  // project-id
      'uint:1'   // milestone-id
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
    
    // Check milestone details
    const milestone = clarity.callReadOnly('production-milestone', 'get-milestone', [
      'uint:1',  // project-id
      'uint:1'   // milestone-id
    ]);
    
    expect(milestone.success).toBe(true);
    expect(milestone.value.completed).toBe(true);
    expect(milestone.value.funds-released).toBe(false);
  });
  
  it('should release funds for a completed milestone', () => {
    // Add a milestone
    clarity.callPublic('production-milestone', 'add-milestone', [
      'uint:1',  // project-id
      'string-utf8:Pre-production completed',  // description
      'uint:200000'  // funds-allocated
    ]);
    
    // Complete the milestone
    clarity.callPublic('production-milestone', 'complete-milestone', [
      'uint:1',  // project-id
      'uint:1'   // milestone-id
    ]);
    
    // Release funds
    const result = clarity.callPublic('production-milestone', 'release-milestone-funds', [
      'uint:1',  // project-id
      'uint:1'   // milestone-id
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(200000); // Amount released
    
    // Check milestone details
    const milestone = clarity.callReadOnly('production-milestone', 'get-milestone', [
      'uint:1',  // project-id
      'uint:1'   // milestone-id
    ]);
    
    expect(milestone.success).toBe(true);
    expect(milestone.value.completed).toBe(true);
    expect(milestone.value.funds-released).toBe(true);
  });
});
