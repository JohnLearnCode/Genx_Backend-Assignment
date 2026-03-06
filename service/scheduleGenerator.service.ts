import {
  IGenerateScheduleInput,
  IGenerateScheduleOutput,
  IScheduleGeneratorError,
} from '../types/scheduleGenerator.types';
import {
  isValidDateFormat,
  formatDate,
  parseDate,
  getWeekday,
  addDays,
  isDateInRange,
} from '../utils/dateUtils';

export class ScheduleGeneratorService {
  /**
   * Validate input parameters
   */
  private validateInput(input: IGenerateScheduleInput): IScheduleGeneratorError[] {
    const errors: IScheduleGeneratorError[] = [];

    // Validate startDate
    if (!input.startDate) {
      errors.push({
        field: 'startDate',
        message: 'Start date is required',
      });
    } else if (!isValidDateFormat(input.startDate)) {
      errors.push({
        field: 'startDate',
        message: 'Start date must be in YYYY-MM-DD format',
      });
    }

    // Validate totalClasses
    if (typeof input.totalClasses !== 'number') {
      errors.push({
        field: 'totalClasses',
        message: 'Total classes must be a number',
      });
    } else if (input.totalClasses < 1) {
      errors.push({
        field: 'totalClasses',
        message: 'Total classes must be at least 1',
      });
    } else if (!Number.isInteger(input.totalClasses)) {
      errors.push({
        field: 'totalClasses',
        message: 'Total classes must be an integer',
      });
    }

    // Validate classWeekdays
    if (!Array.isArray(input.classWeekdays)) {
      errors.push({
        field: 'classWeekdays',
        message: 'Class weekdays must be an array',
      });
    } else if (input.classWeekdays.length === 0) {
      errors.push({
        field: 'classWeekdays',
        message: 'Class weekdays must contain at least one day',
      });
    } else {
      for (const day of input.classWeekdays) {
        if (!Number.isInteger(day) || day < 0 || day > 6) {
          errors.push({
            field: 'classWeekdays',
            message: 'Class weekdays must contain integers between 0 (Monday) and 6 (Sunday)',
          });
          break;
        }
      }
    }

    // Validate holidays
    if (!Array.isArray(input.holidays)) {
      errors.push({
        field: 'holidays',
        message: 'Holidays must be an array',
      });
    } else {
      for (let i = 0; i < input.holidays.length; i++) {
        if (!isValidDateFormat(input.holidays[i])) {
          errors.push({
            field: 'holidays',
            message: `Holiday at index ${i} (${input.holidays[i]}) is not in YYYY-MM-DD format`,
          });
        }
      }
    }

    // Validate holidayRanges
    if (!Array.isArray(input.holidayRanges)) {
      errors.push({
        field: 'holidayRanges',
        message: 'Holiday ranges must be an array',
      });
    } else {
      for (let i = 0; i < input.holidayRanges.length; i++) {
        const range = input.holidayRanges[i];
        if (!Array.isArray(range) || range.length !== 2) {
          errors.push({
            field: 'holidayRanges',
            message: `Holiday range at index ${i} must be an array of 2 dates [start, end]`,
          });
          continue;
        }

        const [start, end] = range;
        if (!isValidDateFormat(start)) {
          errors.push({
            field: 'holidayRanges',
            message: `Holiday range start at index ${i} (${start}) is not in YYYY-MM-DD format`,
          });
        }
        if (!isValidDateFormat(end)) {
          errors.push({
            field: 'holidayRanges',
            message: `Holiday range end at index ${i} (${end}) is not in YYYY-MM-DD format`,
          });
        }

        // Check if start <= end
        if (isValidDateFormat(start) && isValidDateFormat(end)) {
          const startDate = parseDate(start);
          const endDate = parseDate(end);
          if (startDate > endDate) {
            errors.push({
              field: 'holidayRanges',
              message: `Holiday range at index ${i}: start date must be before or equal to end date`,
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Normalize classWeekdays: remove duplicates and sort
   */
  private normalizeWeekdays(weekdays: number[]): number[] {
    const unique = Array.from(new Set(weekdays));
    return unique.sort((a, b) => a - b);
  }

  /**
   * Check if a date is a holiday (in holidays list or in any holidayRanges)
   */
  private isHoliday(
    date: Date,
    holidays: Set<string>,
    holidayRanges: Array<[Date, Date]>
  ): boolean {
    const dateStr = formatDate(date);

    // Check if in holidays list
    if (holidays.has(dateStr)) {
      return true;
    }

    // Check if in any holiday range
    for (const [start, end] of holidayRanges) {
      if (isDateInRange(date, start, end)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate schedule
   */
  generateSchedule(input: IGenerateScheduleInput): IGenerateScheduleOutput {
    // Validate input
    const errors = this.validateInput(input);
    if (errors.length > 0) {
      throw {
        status: 400,
        message: 'Validation errors',
        errors,
      };
    }

    // Normalize weekdays
    const validWeekdays = new Set(this.normalizeWeekdays(input.classWeekdays));

    // Parse holidays
    const holidaySet = new Set(input.holidays);

    // Parse holiday ranges
    const holidayRanges: Array<[Date, Date]> = input.holidayRanges.map(([start, end]) => [
      parseDate(start),
      parseDate(end),
    ]);

    // Start generating schedule
    const schedule: string[] = [];
    let currentDate = parseDate(input.startDate);
    let classesGenerated = 0;

    // Maximum iterations to prevent infinite loop (safety check)
    const MAX_ITERATIONS = 10000;
    let iterations = 0;

    while (classesGenerated < input.totalClasses && iterations < MAX_ITERATIONS) {
      iterations++;

      // Get weekday of current date (0=Monday, 6=Sunday)
      const weekday = getWeekday(currentDate);

      // Check if this date is a valid class day
      const isValidWeekday = validWeekdays.has(weekday);
      const isNotHoliday = !this.isHoliday(currentDate, holidaySet, holidayRanges);

      if (isValidWeekday && isNotHoliday) {
        // This is a valid class day
        schedule.push(formatDate(currentDate));
        classesGenerated++;
      }

      // Move to next day
      currentDate = addDays(currentDate, 1);
    }

    // Safety check: if we hit max iterations without generating enough classes
    if (classesGenerated < input.totalClasses) {
      throw {
        status: 500,
        message: 'Unable to generate schedule: exceeded maximum iterations. Please check your input parameters.',
      };
    }

    // Get the last date
    const endDate = schedule[schedule.length - 1];

    return {
      endDate,
      fullSchedule: schedule,
    };
  }

  /**
   * Generate schedule with detailed info (for debugging/logging)
   */
  generateScheduleWithDetails(input: IGenerateScheduleInput): {
    schedule: IGenerateScheduleOutput;
    statistics: {
      totalDaysScanned: number;
      daysSkippedDueToWeekday: number;
      daysSkippedDueToHolidays: number;
      normalizedWeekdays: number[];
    };
  } {
    // Validate and normalize
    const errors = this.validateInput(input);
    if (errors.length > 0) {
      throw {
        status: 400,
        message: 'Validation errors',
        errors,
      };
    }

    const validWeekdays = new Set(this.normalizeWeekdays(input.classWeekdays));
    const normalizedWeekdaysArray = Array.from(validWeekdays);
    const holidaySet = new Set(input.holidays);
    const holidayRanges: Array<[Date, Date]> = input.holidayRanges.map(([start, end]) => [
      parseDate(start),
      parseDate(end),
    ]);

    // Statistics
    let totalDaysScanned = 0;
    let daysSkippedDueToWeekday = 0;
    let daysSkippedDueToHolidays = 0;

    const schedule: string[] = [];
    let currentDate = parseDate(input.startDate);
    let classesGenerated = 0;

    const MAX_ITERATIONS = 10000;
    let iterations = 0;

    while (classesGenerated < input.totalClasses && iterations < MAX_ITERATIONS) {
      iterations++;
      totalDaysScanned++;

      const weekday = getWeekday(currentDate);
      const isValidWeekday = validWeekdays.has(weekday);
      const isNotHoliday = !this.isHoliday(currentDate, holidaySet, holidayRanges);

      if (!isValidWeekday) {
        daysSkippedDueToWeekday++;
      } else if (!isNotHoliday) {
        daysSkippedDueToHolidays++;
      } else {
        schedule.push(formatDate(currentDate));
        classesGenerated++;
      }

      currentDate = addDays(currentDate, 1);
    }

    if (classesGenerated < input.totalClasses) {
      throw {
        status: 500,
        message: 'Unable to generate schedule: exceeded maximum iterations',
      };
    }

    const endDate = schedule[schedule.length - 1];

    return {
      schedule: {
        endDate,
        fullSchedule: schedule,
      },
      statistics: {
        totalDaysScanned,
        daysSkippedDueToWeekday,
        daysSkippedDueToHolidays,
        normalizedWeekdays: normalizedWeekdaysArray,
      },
    };
  }
}
