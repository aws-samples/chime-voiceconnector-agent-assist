import Template from 'cloudform-types/types/template';
/**
 * A reference map maps a resource id to all locations that reference that
 * resource via a Fn.Ref or Fn.GetAtt intrinsic function.
 */
export interface ReferenceMap {
    [referenceId: string]: string[][];
}
/**
 * Returns a map where the key is the logical id of the resource and the
 * value is a list locations where that resource is referenced.
 * @param template The template
 */
export declare function getTemplateReferences(template: Template): ReferenceMap;
