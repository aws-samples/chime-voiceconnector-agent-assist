import { TransformerContext } from './TransformerContext';
import { DeploymentResources } from './DeploymentResources';
export declare class TransformFormatter {
    private schemaResourceUtil;
    /**
     * Formats the ctx into a set of deployment resources.
     *
     * At this point, all resources that were created by scanning/reading
     * GraphQL schema and cloudformation template files have been collected into
     * a singular ctx.template object. Doing this allows the CLI to perform
     * sophisticated mapping, de-duplication, stack references with correct
     * import/export values, and other nice cleanup routines. Once this is
     * complete, the singular object can be split into the necessary stacks
     * (splitStack) for each GraphQL resource.
     *
     * @param ctx the transformer context.
     * Returns all the deployment resources for the transformation.
     */
    format(ctx: TransformerContext): DeploymentResources;
    /**
     * Schema helper to pull resources from the context and output the final schema resource.
     */
    private buildSchema;
    /**
     * Builds the schema and creates the schema record to pull from S3.
     * Returns the schema SDL text as a string.
     */
    private buildAndSetSchema;
    private collectResolversFunctionsAndSchema;
    private replaceResolverRecord;
    private replaceFunctionConfigurationRecord;
}
