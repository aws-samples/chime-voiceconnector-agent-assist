var getDefaultAdapter = function () {
    if (window.indexedDB) {
        return require('../indexeddb').default;
    }
    if (process && process.env) {
        throw new Error('Node is not supported');
    }
};
export default getDefaultAdapter;
//# sourceMappingURL=index.js.map