import 'moment-timezone';
import 'moment-jdateformatparser';
declare module 'moment' {
    interface Moment {
        toMomentFormatString: (format: string) => string;
        formatWithJDF: (format: string) => string;
    }
}
export declare const time: () => {
    nowISO8601(t: any): string;
    nowEpochSeconds(): number;
    nowEpochMilliSeconds(): number;
    nowFormatted(format: string, timezone?: string): string;
    parseFormattedToEpochMilliSeconds(dateTime: string, format: string, timezone?: string): number;
    parseISO8601ToEpochMilliSeconds(dateTime: any): number;
    epochMilliSecondsToSeconds(milliseconds: number): number;
    epochMilliSecondsToISO8601(dateTime: number): string;
    epochMilliSecondsToFormatted(timestamp: number, format: string, timezone?: string): string;
};
