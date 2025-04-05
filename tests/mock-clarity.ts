// A simple mock for Clarity contract testing with Vitest
export function mockClarity() {
	const state = {
		contracts: {},
		maps: {},
		vars: {},
		principals: {}
	};
	
	return {
		reset() {
			state.maps = {};
			state.vars = {};
			state.principals = {};
		},
		
		deployContract(name, code) {
			state.contracts[name] = code;
			state.maps[name] = {};
			state.vars[name] = {};
		},
		
		callPublic(contract, function_name, args, sender = 'tx-sender') {
			// In a real implementation, this would interpret the Clarity code
			// For this mock, we'll simulate the behavior of our contracts
			
			state.principals.current = sender;
			
			// Simulate contract functions based on the contract and function name
			switch(`${contract}.${function_name}`) {
				case 'project-verification.register-project':
					return this._simulateRegisterProject(args);
				case 'project-verification.verify-project':
					return this._simulateVerifyProject(args);
				case 'investment-management.invest':
					return this._simulateInvest(args);
				case 'production-milestone.add-milestone':
					return this._simulateAddMilestone(args);
				case 'production-milestone.complete-milestone':
					return this._simulateCompleteMilestone(args);
				case 'production-milestone.release-milestone-funds':
					return this._simulateReleaseMilestoneFunds(args);
				case 'revenue-distribution.record-revenue':
					return this._simulateRecordRevenue(args);
				case 'revenue-distribution.create-distribution':
					return this._simulateCreateDistribution(args);
				case 'revenue-distribution.complete-distribution':
					return this._simulateCompleteDistribution(args);
				default:
					return { success: false, error: 'Function not implemented in mock' };
			}
		},
		
		callReadOnly(contract, function_name, args) {
			// Simulate read-only functions
			switch(`${contract}.${function_name}`) {
				case 'project-verification.get-project':
					return this._simulateGetProject(args);
				case 'project-verification.is-project-verified':
					return this._simulateIsProjectVerified(args);
				case 'investment-management.get-investment':
					return this._simulateGetInvestment(args);
				case 'investment-management.get-project-investment':
					return this._simulateGetProjectInvestment(args);
				case 'production-milestone.get-milestone':
					return this._simulateGetMilestone(args);
				case 'production-milestone.get-milestone-count':
					return this._simulateGetMilestoneCount(args);
				case 'revenue-distribution.get-project-revenue':
					return this._simulateGetProjectRevenue(args);
				case 'revenue-distribution.get-distribution':
					return this._simulateGetDistribution(args);
				case 'revenue-distribution.get-available-revenue':
					return this._simulateGetAvailableRevenue(args);
				default:
					return { success: false, error: 'Function not implemented in mock' };
			}
		},
		
		// Project Verification simulations
		_simulateRegisterProject(args) {
			const title = args[0].replace('string-utf8:', '');
			const director = args[1].replace('string-utf8:', '');
			const budget = parseInt(args[2].replace('uint:', ''));
			const startDate = parseInt(args[3].replace('uint:', ''));
			const endDate = parseInt(args[4].replace('uint:', ''));
			
			if (!state.vars['project-id-counter']) {
				state.vars['project-id-counter'] = 0;
			}
			
			const newId = state.vars['project-id-counter'] + 1;
			state.vars['project-id-counter'] = newId;
			
			if (!state.maps['film-projects']) {
				state.maps['film-projects'] = {};
			}
			
			state.maps['film-projects'][newId] = {
				title,
				director,
				budget,
				'start-date': startDate,
				'end-date': endDate,
				verified: false,
				active: true
			};
			
			return { success: true, value: newId };
		},
		
		_simulateVerifyProject(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			
			if (!state.maps['film-projects'] || !state.maps['film-projects'][projectId]) {
				return { success: false, error: 'Project not found' };
			}
			
			state.maps['film-projects'][projectId].verified = true;
			
			return { success: true, value: true };
		},
		
		_simulateGetProject(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			
			if (!state.maps['film-projects'] || !state.maps['film-projects'][projectId]) {
				return { success: true, value: null };
			}
			
			return { success: true, value: state.maps['film-projects'][projectId] };
		},
		
		_simulateIsProjectVerified(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			
			if (!state.maps['film-projects'] || !state.maps['film-projects'][projectId]) {
				return { success: true, value: false };
			}
			
			return { success: true, value: state.maps['film-projects'][projectId].verified };
		},
		
		// Investment Management simulations
		_simulateInvest(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const amount = parseInt(args[1].replace('uint:', ''));
			const investor = state.principals.current;
			
			if (!state.maps['project-investments']) {
				state.maps['project-investments'] = {};
			}
			
			if (!state.maps['investments']) {
				state.maps['investments'] = {};
			}
			
			// Get current project investment data
			const projectKey = `${projectId}`;
			let projectData = state.maps['project-investments'][projectKey] || { 'total-investment': 0, 'investor-count': 0 };
			
			// Get current investor data
			const investmentKey = `${projectId}-${investor}`;
			let investmentData = state.maps['investments'][investmentKey] || { amount: 0, 'ownership-percentage': 0, timestamp: 0 };
			
			// Calculate new values
			const newTotal = projectData['total-investment'] + amount;
			const newAmount = investmentData.amount + amount;
			const newOwnership = Math.floor((newAmount * 10000) / newTotal);
			const newInvestorCount = investmentData.amount === 0 ? projectData['investor-count'] + 1 : projectData['investor-count'];
			
			// Update project investment
			state.maps['project-investments'][projectKey] = {
				'total-investment': newTotal,
				'investor-count': newInvestorCount
			};
			
			// Update investment
			state.maps['investments'][investmentKey] = {
				amount: newAmount,
				'ownership-percentage': newOwnership,
				timestamp: 123 // Mock block height
			};
			
			return { success: true, value: newOwnership };
		},
		
		_simulateGetInvestment(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const investor = args[1].replace('principal:', '');
			
			if (!state.maps['investments']) {
				return { success: true, value: null };
			}
			
			const investmentKey = `${projectId}-${investor}`;
			return { success: true, value: state.maps['investments'][investmentKey] || null };
		},
		
		_simulateGetProjectInvestment(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			
			if (!state.maps['project-investments']) {
				return { success: true, value: null };
			}
			
			const projectKey = `${projectId}`;
			return { success: true, value: state.maps['project-investments'][projectKey] || null };
		},
		
		// Production Milestone simulations
		_simulateAddMilestone(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const description = args[1].replace('string-utf8:', '');
			const fundsAllocated = parseInt(args[2].replace('uint:', ''));
			
			if (!state.maps['milestone-counters']) {
				state.maps['milestone-counters'] = {};
			}
			
			if (!state.maps['milestones']) {
				state.maps['milestones'] = {};
			}
			
			// Get current counter
			const counterKey = `${projectId}`;
			let counterData = state.maps['milestone-counters'][counterKey] || { counter: 0 };
			
			// Calculate new ID
			const newId = counterData.counter + 1;
			
			// Update counter
			state.maps['milestone-counters'][counterKey] = { counter: newId };
			
			// Add milestone
			const milestoneKey = `${projectId}-${newId}`;
			state.maps['milestones'][milestoneKey] = {
				description,
				'funds-allocated': fundsAllocated,
				completed: false,
				'funds-released': false,
				'completion-date': 0
			};
			
			return { success: true, value: newId };
		},
		
		_simulateCompleteMilestone(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const milestoneId = parseInt(args[1].replace('uint:', ''));
			
			if (!state.maps['milestones']) {
				return { success: false, error: 'Milestone not found' };
			}
			
			const milestoneKey = `${projectId}-${milestoneId}`;
			if (!state.maps['milestones'][milestoneKey]) {
				return { success: false, error: 'Milestone not found' };
			}
			
			if (state.maps['milestones'][milestoneKey].completed) {
				return { success: false, error: 'Milestone already completed' };
			}
			
			state.maps['milestones'][milestoneKey].completed = true;
			state.maps['milestones'][milestoneKey]['completion-date'] = 123; // Mock block height
			
			return { success: true, value: true };
		},
		
		_simulateReleaseMilestoneFunds(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const milestoneId = parseInt(args[1].replace('uint:', ''));
			
			if (!state.maps['milestones']) {
				return { success: false, error: 'Milestone not found' };
			}
			
			const milestoneKey = `${projectId}-${milestoneId}`;
			if (!state.maps['milestones'][milestoneKey]) {
				return { success: false, error: 'Milestone not found' };
			}
			
			if (!state.maps['milestones'][milestoneKey].completed) {
				return { success: false, error: 'Milestone not completed' };
			}
			
			if (state.maps['milestones'][milestoneKey]['funds-released']) {
				return { success: false, error: 'Funds already released' };
			}
			
			state.maps['milestones'][milestoneKey]['funds-released'] = true;
			
			return { success: true, value: state.maps['milestones'][milestoneKey]['funds-allocated'] };
		},
		
		_simulateGetMilestone(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const milestoneId = parseInt(args[1].replace('uint:', ''));
			
			if (!state.maps['milestones']) {
				return { success: true, value: null };
			}
			
			const milestoneKey = `${projectId}-${milestoneId}`;
			return { success: true, value: state.maps['milestones'][milestoneKey] || null };
		},
		
		_simulateGetMilestoneCount(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			
			if (!state.maps['milestone-counters']) {
				return { success: true, value: 0 };
			}
			
			const counterKey = `${projectId}`;
			const counterData = state.maps['milestone-counters'][counterKey] || { counter: 0 };
			
			return { success: true, value: counterData.counter };
		},
		
		// Revenue Distribution simulations
		_simulateRecordRevenue(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const amount = parseInt(args[1].replace('uint:', ''));
			
			if (!state.maps['project-revenue']) {
				state.maps['project-revenue'] = {};
			}
			
			const revenueKey = `${projectId}`;
			let revenueData = state.maps['project-revenue'][revenueKey] || {
				'total-revenue': 0,
				'distributed-revenue': 0,
				'last-distribution': 0
			};
			
			state.maps['project-revenue'][revenueKey] = {
				'total-revenue': revenueData['total-revenue'] + amount,
				'distributed-revenue': revenueData['distributed-revenue'],
				'last-distribution': revenueData['last-distribution']
			};
			
			return { success: true, value: true };
		},
		
		_simulateCreateDistribution(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const amount = parseInt(args[1].replace('uint:', ''));
			
			if (!state.maps['project-revenue']) {
				return { success: false, error: 'No revenue recorded' };
			}
			
			const revenueKey = `${projectId}`;
			let revenueData = state.maps['project-revenue'][revenueKey] || {
				'total-revenue': 0,
				'distributed-revenue': 0,
				'last-distribution': 0
			};
			
			const availableRevenue = revenueData['total-revenue'] - revenueData['distributed-revenue'];
			
			if (amount > availableRevenue) {
				return { success: false, error: 'Insufficient available revenue' };
			}
			
			if (!state.maps['distribution-counters']) {
				state.maps['distribution-counters'] = {};
			}
			
			if (!state.maps['distributions']) {
				state.maps['distributions'] = {};
			}
			
			// Get current counter
			const counterKey = `${projectId}`;
			let counterData = state.maps['distribution-counters'][counterKey] || { counter: 0 };
			
			// Calculate new ID
			const newId = counterData.counter + 1;
			
			// Update counter
			state.maps['distribution-counters'][counterKey] = { counter: newId };
			
			// Add distribution
			const distributionKey = `${projectId}-${newId}`;
			state.maps['distributions'][distributionKey] = {
				amount,
				timestamp: 123, // Mock block height
				completed: false
			};
			
			// Update project revenue
			state.maps['project-revenue'][revenueKey] = {
				'total-revenue': revenueData['total-revenue'],
				'distributed-revenue': revenueData['distributed-revenue'] + amount,
				'last-distribution': 123 // Mock block height
			};
			
			return { success: true, value: newId };
		},
		
		_simulateCompleteDistribution(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const distributionId = parseInt(args[1].replace('uint:', ''));
			
			if (!state.maps['distributions']) {
				return { success: false, error: 'Distribution not found' };
			}
			
			const distributionKey = `${projectId}-${distributionId}`;
			if (!state.maps['distributions'][distributionKey]) {
				return { success: false, error: 'Distribution not found' };
			}
			
			if (state.maps['distributions'][distributionKey].completed) {
				return { success: false, error: 'Distribution already completed' };
			}
			
			state.maps['distributions'][distributionKey].completed = true;
			
			return { success: true, value: true };
		},
		
		_simulateGetProjectRevenue(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			
			if (!state.maps['project-revenue']) {
				return { success: true, value: null };
			}
			
			const revenueKey = `${projectId}`;
			return { success: true, value: state.maps['project-revenue'][revenueKey] || null };
		},
		
		_simulateGetDistribution(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			const distributionId = parseInt(args[1].replace('uint:', ''));
			
			if (!state.maps['distributions']) {
				return { success: true, value: null };
			}
			
			const distributionKey = `${projectId}-${distributionId}`;
			return { success: true, value: state.maps['distributions'][distributionKey] || null };
		},
		
		_simulateGetAvailableRevenue(args) {
			const projectId = parseInt(args[0].replace('uint:', ''));
			
			if (!state.maps['project-revenue']) {
				return { success: true, value: 0 };
			}
			
			const revenueKey = `${projectId}`;
			const revenueData = state.maps['project-revenue'][revenueKey] || {
				'total-revenue': 0,
				'distributed-revenue': 0,
				'last-distribution': 0
			};
			
			return { success: true, value: revenueData['total-revenue'] - revenueData['distributed-revenue'] };
		}
	};
}
