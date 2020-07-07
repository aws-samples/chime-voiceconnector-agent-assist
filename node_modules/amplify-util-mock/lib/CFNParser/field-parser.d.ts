import { CloudFormationParseContext } from './types';
export declare function addIntrinsicFunction(keyword: string, func: (node: any, cfnContext: CloudFormationParseContext, parse: Function) => void): void;
export declare function parseValue(node: any, context: CloudFormationParseContext): any;
