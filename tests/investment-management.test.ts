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
  
  it('should calculate correct ownership percentages for multiple investors', () => {
    // First investor puts in 100,000
    clarity.callPublic('investment-management', 'invest', [
      'uint:1',  // project-id
      'uint:100000'  // amount
    ], 'investor1');
    
    // Second investor puts in 100,000
    const result = clarity.callPublic('investment-management', 'invest', [
      'uint:1',  // project-id
      'uint:100000'  // amount
    ], 'investor2');
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(5000); // 50% ownership in basis points
    
    // Check first investor's ownership is now 50%
    const investment1 = clarity.callReadOnly('investment-management', 'get-investment', [
      'uint:1',  // project-id
      'principal:investor1'  // investor
    ]);
    
    expect(investment1.success).toBe(true);
    expect(investment1.value.ownership-percentage).toBe(5000); // 50% ownership in basis points
  });
  
  it('should track total investment for a project', () => {
    // First investor puts in 100,000
    clarity.callPublic('investment-management', 'invest', [
      'uint:1',  // project-id
      'uint:100000'  // amount
    ], 'investor1');
    
    // Second investor puts in 150,000
    clarity.callPublic('investment-management', 'invest', [
      'uint:1',  // project-id
      'uint:150000'  // amount
    ], 'investor2');
    
    // Check total investment
    const projectInvestment = clarity.callReadOnly('investment-management', 'get-project-investment', [
      'uint:1'  // project-id
    ]);
    
    expect(projectInvestment.success).toBe(true);
    expect(projectInvestment.value.total-investment).toBe(250000);
    expect(projectInvestment.value.investor-count).toBe(2);
  });
});
