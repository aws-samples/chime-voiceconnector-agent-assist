export function mergeArguments(args1, args2) {
    return deduplicateArguments([].concat(args2, args1).filter(a => a));
}
function deduplicateArguments(args) {
    return args.reduce((acc, current) => {
        const dup = acc.find(arg => arg.name.value === current.name.value);
        if (!dup) {
            return acc.concat([current]);
        }
        return acc;
    }, []);
}
//# sourceMappingURL=arguments.js.map