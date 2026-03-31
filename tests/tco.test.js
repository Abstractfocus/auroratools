/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('TCO Calculator', () => {
    let mockElements;

    beforeEach(() => {
        mockElements = {};
        document.getElementById = jest.fn((id) => {
            if (!mockElements[id]) {
                mockElements[id] = { value: '', innerHTML: '' };
            }
            return mockElements[id];
        });
        // createBarChart is called inside calculateTCO, mock it
        global.createBarChart = jest.fn(() => '');
    });

    function loadCalculator() {
        const code = fs.readFileSync(path.join(__dirname, '..', 'tco.js'), 'utf8');
        eval(code);
        return calculateTCO;
    }

    test('calculates correct TCO with software=50000, hardware=20000, implementation=10000, training=5000, maintenance=12000, years=3', () => {
        mockElements['softwareCost'] = { value: '50000' };
        mockElements['hardwareCost'] = { value: '20000' };
        mockElements['implementationCost'] = { value: '10000' };
        mockElements['trainingCost'] = { value: '5000' };
        mockElements['annualMaintenance'] = { value: '12000' };
        mockElements['yearsOwned'] = { value: '3' };
        mockElements['tcoResult'] = { innerHTML: '', appendChild: jest.fn() };

        const calculateTCO = loadCalculator();
        calculateTCO();

        const result = mockElements['tcoResult'].innerHTML;

        // upfront = 50000 + 20000 + 10000 + 5000 = 85000
        // ongoing = 12000 * 3 = 36000
        // total = 85000 + 36000 = 121000
        // annualized = 121000 / 3 = 40333.33...
        // monthly = 40333.33 / 12 = 3361.11...

        expect(result).toContain('85');
        expect(result).toContain('36');
        expect(result).toContain('121');
        expect(result).toContain('40,333.3');
        expect(result).toContain('3,361.1');
    });

    test('rejects yearsOwned=0 with validation error', () => {
        mockElements['softwareCost'] = { value: '50000' };
        mockElements['hardwareCost'] = { value: '0' };
        mockElements['implementationCost'] = { value: '0' };
        mockElements['trainingCost'] = { value: '0' };
        mockElements['annualMaintenance'] = { value: '0' };
        mockElements['yearsOwned'] = { value: '0' };
        mockElements['tcoResult'] = { innerHTML: '', appendChild: jest.fn() };

        const calculateTCO = loadCalculator();
        calculateTCO();

        const result = mockElements['tcoResult'].innerHTML;
        expect(result).toContain('error');
        expect(result).toContain('Ownership period must be at least 1 year');
    });
});
