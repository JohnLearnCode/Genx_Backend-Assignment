/**
 * Schedule Generator Examples
 * 
 * This file contains example inputs and expected outputs for the Schedule Generator Service
 */

import { IGenerateScheduleInput } from '../types/scheduleGenerator.types';

// Example 1: Basic schedule (Tuesday & Thursday)
export const example1: IGenerateScheduleInput = {
  startDate: '2026-01-01',
  totalClasses: 8,
  classWeekdays: [1, 3], // Tuesday & Thursday
  holidays: [],
  holidayRanges: [],
};
// Expected output:
// {
//   "endDate": "2026-02-05",
//   "fullSchedule": [
//     "2026-01-06", "2026-01-08", "2026-01-13", "2026-01-15",
//     "2026-01-20", "2026-01-22", "2026-01-27", "2026-01-29"
//   ]
// }

// Example 2: Schedule with holidays
export const example2: IGenerateScheduleInput = {
  startDate: '2026-01-01',
  totalClasses: 10,
  classWeekdays: [1, 3],
  holidays: ['2026-01-06', '2026-01-22'],
  holidayRanges: [],
};
// Expected: Skips 2026-01-06 and 2026-01-22

// Example 3: Schedule with Tet holiday range
export const example3: IGenerateScheduleInput = {
  startDate: '2026-01-01',
  totalClasses: 16,
  classWeekdays: [1, 3],
  holidays: ['2026-04-30', '2026-05-01'],
  holidayRanges: [['2026-01-26', '2026-02-05']], // Tet holiday
};
// Expected: Skips entire Tet period from Jan 26 to Feb 05

// Example 4: Weekend classes
export const example4: IGenerateScheduleInput = {
  startDate: '2026-01-01',
  totalClasses: 6,
  classWeekdays: [5, 6], // Saturday & Sunday
  holidays: [],
  holidayRanges: [],
};
// Expected: Only Saturday and Sunday dates

// Example 5: Intensive course (Mon, Wed, Fri)
export const example5: IGenerateScheduleInput = {
  startDate: '2026-01-05',
  totalClasses: 12,
  classWeekdays: [0, 2, 4], // Monday, Wednesday, Friday
  holidays: ['2026-01-19'],
  holidayRanges: [],
};

// Example 6: Edge case - Duplicate and unsorted weekdays
export const example6: IGenerateScheduleInput = {
  startDate: '2026-01-01',
  totalClasses: 5,
  classWeekdays: [3, 1, 3, 1], // Will be normalized to [1, 3]
  holidays: [],
  holidayRanges: [],
};

// Example 7: Multiple holiday ranges
export const example7: IGenerateScheduleInput = {
  startDate: '2026-01-01',
  totalClasses: 20,
  classWeekdays: [1, 3],
  holidays: ['2026-04-30', '2026-05-01', '2026-09-02'],
  holidayRanges: [
    ['2026-01-26', '2026-02-05'], // Tet
    ['2026-07-01', '2026-07-10'], // Summer break
  ],
};

// Example 8: Vietnam school year schedule
export const vietnamSchoolYear2026: IGenerateScheduleInput = {
  startDate: '2026-09-05', // School starts
  totalClasses: 70, // ~35 weeks, 2x per week
  classWeekdays: [1, 4], // Tuesday & Friday
  holidays: [
    '2026-09-02', // National Day
    '2026-12-25', // Christmas
    '2027-01-01', // New Year
  ],
  holidayRanges: [
    ['2026-12-20', '2027-01-03'], // Winter break
    ['2027-01-26', '2027-02-05'], // Tet 2027
    ['2027-04-26', '2027-05-03'], // National holidays
  ],
};

// Example 9: Short course (4 weeks, Mon-Fri)
export const intensiveBootcamp: IGenerateScheduleInput = {
  startDate: '2026-03-02',
  totalClasses: 20,
  classWeekdays: [0, 1, 2, 3, 4], // Mon-Fri
  holidays: [],
  holidayRanges: [],
};
// Expected: 4 weeks of daily classes (Mon-Fri)

// Example 10: Testing with Vietnam holidays 2026
export const vietnamExample2026: IGenerateScheduleInput = {
  startDate: '2026-01-01',
  totalClasses: 30,
  classWeekdays: [1, 3], // Tue & Thu
  holidays: [
    '2026-01-01', // New Year
    '2026-04-30', // Reunification Day
    '2026-05-01', // Labor Day
    '2026-09-02', // National Day
  ],
  holidayRanges: [
    ['2026-01-26', '2026-02-05'], // Tet
  ],
};

/**
 * Invalid examples (should return validation errors)
 */

// Invalid: Wrong date format
export const invalidExample1: any = {
  startDate: '2026/01/01', // Wrong format
  totalClasses: 10,
  classWeekdays: [1, 3],
  holidays: [],
  holidayRanges: [],
};

// Invalid: Negative total classes
export const invalidExample2: any = {
  startDate: '2026-01-01',
  totalClasses: -5,
  classWeekdays: [1, 3],
  holidays: [],
  holidayRanges: [],
};

// Invalid: Weekday out of range
export const invalidExample3: any = {
  startDate: '2026-01-01',
  totalClasses: 10,
  classWeekdays: [1, 7], // 7 is invalid
  holidays: [],
  holidayRanges: [],
};

// Invalid: Empty classWeekdays
export const invalidExample4: any = {
  startDate: '2026-01-01',
  totalClasses: 10,
  classWeekdays: [],
  holidays: [],
  holidayRanges: [],
};

// Invalid: Holiday range start > end
export const invalidExample5: any = {
  startDate: '2026-01-01',
  totalClasses: 10,
  classWeekdays: [1, 3],
  holidays: [],
  holidayRanges: [['2026-02-05', '2026-01-26']], // Start > End
};

/**
 * Test function to run examples
 */
export async function testScheduleGenerator() {
  const examples = [
    { name: 'Example 1: Basic', data: example1 },
    { name: 'Example 2: With Holidays', data: example2 },
    { name: 'Example 3: Tet Holiday', data: example3 },
    { name: 'Example 4: Weekend Classes', data: example4 },
    { name: 'Example 5: Intensive', data: example5 },
    { name: 'Example 6: Normalize Weekdays', data: example6 },
    { name: 'Example 7: Multiple Ranges', data: example7 },
    { name: 'Example 8: School Year', data: vietnamSchoolYear2026 },
    { name: 'Example 9: Bootcamp', data: intensiveBootcamp },
    { name: 'Example 10: Vietnam 2026', data: vietnamExample2026 },
  ];

  console.log('='.repeat(80));
  console.log('Schedule Generator Test Examples');
  console.log('='.repeat(80));

  for (const example of examples) {
    console.log(`\n${example.name}`);
    console.log('-'.repeat(80));
    console.log('Input:', JSON.stringify(example.data, null, 2));

    try {
      const response = await fetch('http://localhost:3000/api/schedule-generator/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(example.data),
      });

      const result = await response.json();
      console.log('Output:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Uncomment to run tests
// testScheduleGenerator();
