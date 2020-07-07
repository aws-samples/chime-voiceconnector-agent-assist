import { JavaArray } from './array';
export declare class JavaString {
    value: string;
    constructor(str: any);
    concat(str: any): JavaString;
    contains(str: any): boolean;
    endsWith(suffix: any): boolean;
    equals(str: any): boolean;
    indexOf(val: any, fromIndex?: number): number;
    isEmpty(): boolean;
    lastIndexOf(val: any, fromIndex?: number): number;
    replace(find: any, replace: any): JavaString;
    replaceAll(find: any, replace: any): JavaString;
    replaceFirst(find: any, replace: any): JavaString;
    matches(regexString: any): boolean;
    split(regexString: any, limit?: any): JavaArray;
    startsWith(prefix: any, toffset?: number): boolean;
    substring(beginIndex: any, endIndex?: number): string;
    toJSON(): string;
    toLowerCase(): JavaString;
    toUpperCase(): JavaString;
    toString(): string;
    toIdString(): string;
    trim(): JavaString;
    length(): number;
}
