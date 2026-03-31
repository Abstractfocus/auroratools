/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Budget Calculator', () => {
    let mockElements;

    beforeEach(() => {
        mockElements = {};
        document.getElementById = jest.fn((id) => {
            if (!mockElements[id]) {
                mockElements[id] = { value: '', innerHTML: '' };
            }
            return mockElements[id];
        });
        // createDonutChart is called inside calculateBudget, mock it
        global.createDonutChart = jest.fn(() => '');
    });

    function loadCalculator() {
        const code = fs.readFileSync(path.join(__dirname, '..', 'budget.js'), 'utf8');
        eval(code);
        return calculateBudget;
    }

    test('calculates correct allocations with total=100000 and default percentages', () => {
        mockElements['totalBudget'] = { value: '100000' };
        mockElements['budgetPersonnel'] = { value: '40' };
        mockElements['budgetTechnology'] = { value: '25' };
        mockElements['budgetMarketing'] = { value: '15' };
        mockElements['budgetOperations'] = { value: '10' };
        mockElements['budgetTraining'] = { value: '5' };
        mockElements['budgetContingency'] = { value: '5' };
        mockElements['budgetResult'] = { innerHTML: '' };

        const calculateBudget = loadCalculator();
        calculateBudget();

        const result = mockElements['budgetResult'].innerHTML;

        // personnel = 100000 * 0.40 = 40000
        // technology = 100000 * 0.25 = 25000
        // marketing = 100000 * 0.15 = 15000
        // operations = 100000 * 0.10 = 10000
        // training = 100000 * 0.05 = 5000
        // contingency = 100000 * 0.05 = 5000

        expect(result).toContain('40,000');
        expect(result).toContain('25,000');
        expect(result).toContain('15,000');
        expect(result).toContain('10,000');
        expect(result).toContain('5,000');
        expect(result).toContain('100,000');
        // No warning since allocations sum to 100%
        expect(result).not.toContain('Warning');
    });

    test('shows allocation warning when percentages do not sum to 100', () => {
        mockElements['totalBudget'] = { value: '100000' };
        mockElements['budgetPersonnel'] = { value: '40' };
        mockElements['budgetTechnology'] = { value: '25' };
        mockElements['budgetMarketing'] = { value: '15' };
        mockElements['budgetOperations'] = { value: '10' };
        mockElements['budgetTraining'] = { value: '5' };
        mockElements['budgetContingency'] = { value: '5' };
        mockElements['budgetResult'] = { innerHTML: '' };

        const calculateBudget = loadCalculator();
        // Set contingency to 10 AFTER loading, since createBudgetDefaults() resets values on load
        mockElements['budgetContingency'].value = '10';  // sum = 105%
        calculateBudget();

        const result = mockElements['budgetResult'].innerHTML;
        expect(result).toContain('Warning');
        expect(result).toContain('105.0%');
        expect(result).toContain('not 100%');
    });
});
