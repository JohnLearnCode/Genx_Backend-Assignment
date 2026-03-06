import { ScheduleGeneratorService } from '../service/scheduleGenerator.service';
import { IGenerateScheduleInput } from '../types/scheduleGenerator.types';

describe('Schedule Generator Service', () => {
  let service: ScheduleGeneratorService;

  beforeEach(() => {
    service = new ScheduleGeneratorService();
  });

  describe('generateSchedule', () => {
    /**
     * Test Case 1: Basic schedule generation without holidays
     */
    test('should generate basic schedule for 2 classes per week without holidays', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05', // Monday
        totalClasses: 4,
        classWeekdays: [0, 2], // Monday and Wednesday (0-indexed, 0=Monday)
        holidays: [],
        holidayRanges: [],
      };

      const result = service.generateSchedule(input);

      expect(result.fullSchedule).toHaveLength(4);
      expect(result.fullSchedule).toEqual([
        '2026-01-05', // Monday
        '2026-01-07', // Wednesday
        '2026-01-12', // Monday
        '2026-01-14', // Wednesday
      ]);
      expect(result.endDate).toBe('2026-01-14');
    });

    /**
     * Test Case 2: Schedule with single day holidays
     */
    test('should skip single day holidays', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 4,
        classWeekdays: [0, 2], // Monday and Wednesday
        holidays: ['2026-01-07', '2026-01-12'], // Skip these dates
        holidayRanges: [],
      };

      const result = service.generateSchedule(input);

      expect(result.fullSchedule).toHaveLength(4);
      // Should skip 2026-01-07 (Wed) and 2026-01-12 (Mon)
      expect(result.fullSchedule).toEqual([
        '2026-01-05', // Monday (first class)
        '2026-01-14', // Wednesday (skipped 01-07 holiday)
        '2026-01-19', // Monday (skipped 01-12 holiday)
        '2026-01-21', // Wednesday
      ]);
    });

    /**
     * Test Case 3: Schedule with holiday ranges
     */
    test('should skip holiday ranges (Tet holiday example)', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 6,
        classWeekdays: [0, 2], // Monday and Wednesday
        holidays: [],
        holidayRanges: [
          ['2026-01-26', '2026-02-05'], // Tet holiday range (inclusive)
        ],
      };

      const result = service.generateSchedule(input);

      expect(result.fullSchedule).toHaveLength(6);
      // Should skip all dates from 01-26 to 02-05 (inclusive)
      expect(result.fullSchedule).toEqual([
        '2026-01-05', // Monday
        '2026-01-07', // Wednesday
        '2026-01-12', // Monday
        '2026-01-14', // Wednesday
        '2026-01-19', // Monday
        '2026-01-21', // Wednesday (before Tet)
        // Skip Tet range [01-26 to 02-05]
        // Next classes after Tet would be 02-09, 02-11, etc.
      ]);

      // Verify first 6 classes end before Tet
      expect(new Date(result.fullSchedule[5]).getTime()).toBeLessThan(new Date('2026-01-26').getTime());
    });

    /**
     * Test Case 4: Edge case - holiday ranges inclusive
     */
    test('should treat holiday ranges as inclusive (both start and end dates)', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-04-27', // Monday
        totalClasses: 4,
        classWeekdays: [0, 2, 4], // Mon, Wed, Fri
        holidays: [],
        holidayRanges: [
          ['2026-04-30', '2026-05-01'], // Should skip both 04-30 and 05-01
        ],
      };

      const result = service.generateSchedule(input);

      expect(result.fullSchedule).toHaveLength(4);
      expect(result.fullSchedule).toEqual([
        '2026-04-27', // Monday (before range)
        '2026-04-29', // Wednesday (before range)
        // Skip 04-30 (Thu - but it's not in classWeekdays anyway)
        // Skip 05-01 (Fri - this IS in classWeekdays, so must skip)
        '2026-05-04', // Monday (after range)
        '2026-05-06', // Wednesday
      ]);

      // Verify 05-01 is NOT in schedule (it's in holiday range)
      expect(result.fullSchedule).not.toContain('2026-05-01');
    });

    /**
     * Test Case 5: Edge case - invalid input (negative totalClasses)
     */
    test('should throw error for invalid totalClasses', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 0, // Invalid
        classWeekdays: [0, 2],
        holidays: [],
        holidayRanges: [],
      };

      expect(() => service.generateSchedule(input)).toThrow();
    });

    /**
     * Test Case 6: Edge case - invalid weekday (out of range 0-6)
     */
    test('should throw error for invalid classWeekdays', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 4,
        classWeekdays: [0, 7], // 7 is invalid (should be 0-6)
        holidays: [],
        holidayRanges: [],
      };

      expect(() => service.generateSchedule(input)).toThrow();
    });

    /**
     * Test Case 7: Edge case - empty classWeekdays
     */
    test('should throw error for empty classWeekdays', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 4,
        classWeekdays: [], // Empty
        holidays: [],
        holidayRanges: [],
      };

      expect(() => service.generateSchedule(input)).toThrow();
    });

    /**
     * Test Case 8: Combined holidays and holiday ranges
     */
    test('should skip both single holidays and holiday ranges', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 8,
        classWeekdays: [0, 2], // Monday and Wednesday
        holidays: ['2026-01-07'], // Single holiday
        holidayRanges: [
          ['2026-01-26', '2026-02-05'], // Tet range
        ],
      };

      const result = service.generateSchedule(input);

      expect(result.fullSchedule).toHaveLength(8);
      // Should skip 01-07 (single holiday)
      expect(result.fullSchedule).not.toContain('2026-01-07');
      // Should skip all dates in Tet range
      const tetStart = new Date('2026-01-26');
      const tetEnd = new Date('2026-02-05');
      result.fullSchedule.forEach((date) => {
        const classDate = new Date(date);
        // If date is in Tet range, it should not be in schedule
        if (classDate >= tetStart && classDate <= tetEnd) {
          fail(`Date ${date} should be skipped (in Tet range)`);
        }
      });
    });

    /**
     * Test Case 9: Weekend schedule (Saturday and Sunday)
     */
    test('should generate weekend schedule correctly', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-03', // Saturday
        totalClasses: 4,
        classWeekdays: [5, 6], // Saturday and Sunday (0=Monday, 5=Saturday, 6=Sunday)
        holidays: [],
        holidayRanges: [],
      };

      const result = service.generateSchedule(input);

      expect(result.fullSchedule).toHaveLength(4);
      expect(result.fullSchedule).toEqual([
        '2026-01-03', // Saturday
        '2026-01-04', // Sunday
        '2026-01-10', // Saturday
        '2026-01-11', // Sunday
      ]);
    });

    /**
     * Test Case 10: Large number of classes (stress test)
     */
    test('should handle large number of classes efficiently', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 100, // Large number
        classWeekdays: [0, 2, 4], // 3 days per week
        holidays: [],
        holidayRanges: [],
      };

      const result = service.generateSchedule(input);

      expect(result.fullSchedule).toHaveLength(100);
      // Should complete within reasonable iterations
      // (100 classes / 3 days per week ≈ 34 weeks)
    });
  });

  describe('generateScheduleWithDetails', () => {
    /**
     * Test Case 11: Verify statistics in detailed response
     */
    test('should return statistics with skipped dates', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 4,
        classWeekdays: [0, 2],
        holidays: ['2026-01-07', '2026-01-12'],
        holidayRanges: [],
      };

      const result = service.generateScheduleWithDetails(input);

      expect(result.schedule.fullSchedule).toHaveLength(4);
      expect(result.statistics.totalDaysScanned).toBeGreaterThan(0);
      expect(result.statistics.daysSkippedDueToHolidays).toBeGreaterThanOrEqual(2);
    });

    /**
     * Test Case 12: Verify statistics structure
     */
    test('should return correct statistics structure', () => {
      const input: IGenerateScheduleInput = {
        startDate: '2026-01-05',
        totalClasses: 8,
        classWeekdays: [0, 2], // 2 days per week
        holidays: [],
        holidayRanges: [],
      };

      const result = service.generateScheduleWithDetails(input);

      expect(result.schedule.fullSchedule).toHaveLength(8);
      expect(result.statistics).toHaveProperty('totalDaysScanned');
      expect(result.statistics).toHaveProperty('daysSkippedDueToWeekday');
      expect(result.statistics).toHaveProperty('daysSkippedDueToHolidays');
      expect(result.statistics).toHaveProperty('normalizedWeekdays');
    });
  });
});
