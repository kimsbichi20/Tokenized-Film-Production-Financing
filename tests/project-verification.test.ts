import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClarity } from './mock-clarity';

// Mock the Clarity environment
const clarity = mockClarity();

// Import the contract code (in a real implementation)
// const contractCode = fs.readFileSync('../contracts/project-verification.clar', 'utf8');
// clarity.deployContract('project-verification', contractCode);

describe('Project Verification Contract', () => {
  beforeEach(() => {
    // Reset contract state
    clarity.reset();
  });
  
  it('should register a new film project', () => {
    const result = clarity.callPublic('project-verification', 'register-project', [
      'string-utf8:The Blockchain Movie',
      'string-utf8:John Director',
      'uint:1000000',
      'uint:20240101',
      'uint:20241231'
    ]);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(1); // First project ID
  });
  
  it('should verify a film project', () => {
    // First register a project
    clarity.callPublic('project-verification', 'register-project', [
      'string-utf8:The Blockchain Movie',
      'string-utf8:John Director',
      'uint:1000000',
      'uint:20240101',
      'uint:20241231'
    ]);
    
    // Then verify it
    const result = clarity.callPublic('project-verification', 'verify-project', ['uint:1']);
    
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
  });
  
  it('should get project details', () => {
    // Register a project
    clarity.callPublic('project-verification', 'register-project', [
      'string-utf8:The Blockchain Movie',
      'string-utf8:John Director',
      'uint:1000000',
      'uint:20240101',
      'uint:20241231'
    ]);
    
    // Get project details
    const result = clarity.callReadOnly('project-verification', 'get-project', ['uint:1']);
    
    expect(result.success).toBe(true);
    expect(result.value.title).toBe('The Blockchain Movie');
    expect(result.value.director).toBe('John Director');
    expect(result.value.budget).toBe(1000000);
    expect(result.value.verified).toBe(false);
  });
  
  it('should check if a project is verified', () => {
    // Register a project
    clarity.callPublic('project-verification', 'register-project', [
      'string-utf8:The Blockchain Movie',
      'string-utf8:John Director',
      'uint:1000000',
      'uint:20240101',
      'uint:20241231'
    ]);
    
    // Check verification status (should be false initially)
    let result = clarity.callReadOnly('project-verification', 'is-project-verified', ['uint:1']);
    expect(result.success).toBe(true);
    expect(result.value).toBe(false);
    
    // Verify the project
    clarity.callPublic('project-verification', 'verify-project', ['uint:1']);
    
    // Check verification status again (should be true now)
    result = clarity.callReadOnly('project-verification', 'is-project-verified', ['uint:1']);
    expect(result.success).toBe(true);
    expect(result.value).toBe(true);
  });
});
