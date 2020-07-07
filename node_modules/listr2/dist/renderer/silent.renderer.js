"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SilentRenderer = void 0;
let SilentRenderer = (() => {
    class SilentRenderer {
        constructor(tasks, options) {
            this.tasks = tasks;
            this.options = options;
        }
        render() { }
        end() { }
    }
    SilentRenderer.nonTTY = true;
    return SilentRenderer;
})();
exports.SilentRenderer = SilentRenderer;
//# sourceMappingURL=silent.renderer.js.map