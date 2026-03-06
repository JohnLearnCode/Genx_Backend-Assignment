export interface IGenerateScheduleInput {
  startDate: string; // YYYY-MM-DD
  totalClasses: number;
  classWeekdays: number[]; // 0=Mon, 1=Tue, ..., 6=Sun
  holidays: string[]; // ["YYYY-MM-DD", ...]
  holidayRanges: Array<[string, string]>; // [["start", "end"], ...]
}

export interface IGenerateScheduleOutput {
  endDate: string; // YYYY-MM-DD
  fullSchedule: string[]; // ["YYYY-MM-DD", ...]
}

export interface IScheduleGeneratorError {
  field: string;
  message: string;
}
