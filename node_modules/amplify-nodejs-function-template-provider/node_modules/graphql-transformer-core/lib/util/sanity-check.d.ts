import { Template } from 'cloudform-types';
interface Diff {
    kind: 'N' | 'E' | 'D' | 'A';
    path: string[];
    lhs?: any;
    rhs?: any;
    index?: number;
    item?: any;
}
/**
 * Calculates a diff between the last saved cloud backend's build directory
 * and the most recent build.
 */
export declare function check(currentCloudBackendDir: string, buildDirectory: string, rootStackName?: string): Promise<void>;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to update a KeySchema after the table has been deployed.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
export declare function cantEditKeySchema(diff: Diff): void;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to add LSIs after the table has been created.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
export declare function cantAddLSILater(diff: Diff): void;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to change GSI KeySchemas after they are created.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
export declare function cantEditGSIKeySchema(diff: Diff, currentBuild: DiffableProject, nextBuild: DiffableProject): void;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to add and remove GSIs at the same time.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
export declare function cantAddAndRemoveGSIAtSameTime(diff: Diff, currentBuild: DiffableProject, nextBuild: DiffableProject): void;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to change LSI KeySchemas after they are created.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
export declare function cantEditLSIKeySchema(diff: Diff, currentBuild: DiffableProject, nextBuild: DiffableProject): void;
export declare function cantHaveMoreThan200Resources(diffs: Diff[], currentBuild: DiffableProject, nextBuild: DiffableProject): void;
interface DiffableProject {
    stacks: {
        [stackName: string]: Template;
    };
    root: Template;
}
export {};
