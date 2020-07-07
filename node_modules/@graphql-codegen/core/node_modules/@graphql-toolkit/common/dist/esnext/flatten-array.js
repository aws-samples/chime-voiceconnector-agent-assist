export const flattenArray = (arr) => arr.reduce((acc, next) => acc.concat(Array.isArray(next) ? flattenArray(next) : next), []);
//# sourceMappingURL=flatten-array.js.map