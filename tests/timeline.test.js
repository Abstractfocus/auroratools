/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Timeline Calculator', () => {
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
        const code = fs.readFileSync(path.join(__dirname, '..', 'timeline.js'), 'utf8');
        eval(code);
        return calculateTimeline;
    }

    test('medium scope, team=5, high complexity yields 12 weeks', () => {
        // baseWeeks=12, multiplier=1.4, teamFactor=max(0.5, 1-(5-1)*0.08)=0.68
        // adjustedWeeks = ceil(12 * 1.4 * 0.68) = ceil(11.424) = 12
        mockElements['projectScope'] = { value: 'medium' };
        mockElements['teamSize'] = { value: '5' };
        mockElements['complexity'] = { value: 'high' };
        mockElements['timelineResult'] = { innerHTML: '' };

        const calculateTimeline = loadCalculator();
        calculateTimeline();

        const result = mockElements['timelineResult'].innerHTML;
        expect(result).toContain('12 weeks');
    });

    test('small scope, team=1, low complexity yields 4 weeks', () => {
        // baseWeeks=4, multiplier=0.8, teamFactor=max(0.5, 1-0*0.08)=1.0
        // adjustedWeeks = ceil(4 * 0.8 * 1.0) = ceil(3.2) = 4
        mockElements['projectScope'] = { value: 'small' };
        mockElements['teamSize'] = { value: '1' };
        mockElements['complexity'] = { value: 'low' };
        mockElements['timelineResult'] = { innerHTML: '' };

        const calculateTimeline = loadCalculator();
        calculateTimeline();

        const result = mockElements['timelineResult'].innerHTML;
        expect(result).toContain('4 weeks');
    });
});
