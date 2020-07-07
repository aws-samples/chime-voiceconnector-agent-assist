import { StringValueNode, TypeDefinitionNode, DocumentNode } from 'graphql';
export declare function resetComments(): void;
export declare function collectComment(node: TypeDefinitionNode): void;
export declare function pushComment(node: {
    readonly description?: StringValueNode;
}, entity: string, field?: string, argument?: string): void;
export declare function printComment(comment: string): string;
export declare function printWithComments(doc: DocumentNode): string;
