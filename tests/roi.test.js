/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('ROI Calculator', () => {
    let mockElements;

    beforeEach(() => {
        mockElements = {};
        document.getElementById = jest.fn((id) => {
            if (!mockElements[id]) {
                mockElements[id] = { value: '', innerHTML: '' };
            }
            return mockElements[id];
        });
    });

    function loadCalculator() {
        const code = fs.readFileSync(path.join(__dirname, '..', 'roi.js'), 'utf8');
        eval(code);
        return calculateROI;
    }

    test('calculates correct ROI with revenue=1000000, employees=50, duration=12', () => {
        mockElements['annualRevenue'] = { value: '1000000' };
        mockElements['employeeCount'] = { value: '50' };
        mockElements['projectDuration'] = { value: '12' };
        mockElements['roiResult'] = { innerHTML: '' };

        const calculateROI = loadCalculator();
        calculateROI();

        const result = mockElements['roiResult'].innerHTML;

        // additionalRevenue = 1000000 * 0.15 = 150000
        // costSavings = 1000000 * 0.7 * 0.10 = 70000
        // productivityGain = (50 * 50000 * 0.20) / 2 = 250000
        // totalBenefit = (150000 + 70000 + 250000) * (12/12) = 470000
        // estimatedFees = 50000 + (1000000 * 0.01) + (50 * 1000) = 110000
        // roi = ((470000 - 110000) / 110000) * 100 = 327.27...%

        expect(result).toContain('327.27');
        expect(result).toContain('150000');
        expect(result).toContain('70000');
        expect(result).toContain('250000');
        expect(result).toContain('470000');
        expect(result).toContain('110000');
    });

    test('shows error when inputs are missing or invalid', () => {
        mockElements['annualRevenue'] = { value: '' };
        mockElements['employeeCount'] = { value: '' };
        mockElements['projectDuration'] = { value: '' };
        mockElements['roiResult'] = { innerHTML: '' };

        const calculateROI = loadCalculator();
        calculateROI();

        const result = mockElements['roiResult'].innerHTML;
        expect(result).toContain('error');
        expect(result).toContain('Annual revenue must be a positive number');
    });
});
