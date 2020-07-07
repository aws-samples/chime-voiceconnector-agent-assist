"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs-extra');
var path_1 = require("path");
var deep_diff_1 = require("deep-diff");
var fileUtils_1 = require("./fileUtils");
var errors_1 = require("../errors");
var __1 = require("..");
/**
 * Calculates a diff between the last saved cloud backend's build directory
 * and the most recent build.
 */
function check(currentCloudBackendDir, buildDirectory, rootStackName) {
    if (rootStackName === void 0) { rootStackName = 'cloudformation-template.json'; }
    return __awaiter(this, void 0, void 0, function () {
        var cloudBackendDirectoryExists, buildDirectoryExists, diffRules, projectRules, current, next, diffs, _i, diffs_1, diff, _a, diffRules_1, rule, _b, projectRules_1, projectRule;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, fs.exists(currentCloudBackendDir)];
                case 1:
                    cloudBackendDirectoryExists = _c.sent();
                    return [4 /*yield*/, fs.exists(buildDirectory)];
                case 2:
                    buildDirectoryExists = _c.sent();
                    diffRules = [
                        cantEditKeySchema,
                        cantAddLSILater,
                        cantEditGSIKeySchema,
                        cantEditLSIKeySchema,
                        cantAddAndRemoveGSIAtSameTime,
                    ];
                    projectRules = [cantHaveMoreThan200Resources];
                    if (!(cloudBackendDirectoryExists && buildDirectoryExists)) return [3 /*break*/, 5];
                    return [4 /*yield*/, loadDiffableProject(currentCloudBackendDir, rootStackName)];
                case 3:
                    current = _c.sent();
                    return [4 /*yield*/, loadDiffableProject(buildDirectory, rootStackName)];
                case 4:
                    next = _c.sent();
                    diffs = deep_diff_1.diff(current, next);
                    // Loop through the diffs and call each DiffRule.
                    // We loop once so each rule does not need to loop.
                    if (diffs) {
                        for (_i = 0, diffs_1 = diffs; _i < diffs_1.length; _i++) {
                            diff = diffs_1[_i];
                            for (_a = 0, diffRules_1 = diffRules; _a < diffRules_1.length; _a++) {
                                rule = diffRules_1[_a];
                                rule(diff, current, next);
                            }
                        }
                        for (_b = 0, projectRules_1 = projectRules; _b < projectRules_1.length; _b++) {
                            projectRule = projectRules_1[_b];
                            projectRule(diffs, current, next);
                        }
                    }
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.check = check;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to update a KeySchema after the table has been deployed.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
function cantEditKeySchema(diff) {
    if (diff.kind === 'E' && diff.path.length === 8 && diff.path[5] === 'KeySchema') {
        // diff.path = [ "stacks", "Todo.json", "Resources", "TodoTable", "Properties", "KeySchema", 0, "AttributeName"]
        var stackName = path_1.basename(diff.path[1], '.json');
        var tableName = diff.path[3];
        throw new errors_1.InvalidMigrationError("Attempting to edit the key schema of the " + tableName + " table in the " + stackName + " stack. ", 'Adding a primary @key directive to an existing @model. ', 'Remove the @key directive or provide a name e.g @key(name: "ByStatus", fields: ["status"]).');
    }
}
exports.cantEditKeySchema = cantEditKeySchema;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to add LSIs after the table has been created.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
function cantAddLSILater(diff) {
    if (
    // When adding a LSI to a table that has 0 LSIs.
    (diff.kind === 'N' && diff.path.length === 6 && diff.path[5] === 'LocalSecondaryIndexes') ||
        // When adding a LSI to a table that already has at least one LSI.
        (diff.kind === 'A' && diff.path.length === 6 && diff.path[5] === 'LocalSecondaryIndexes' && diff.item.kind === 'N')) {
        // diff.path = [ "stacks", "Todo.json", "Resources", "TodoTable", "Properties", "LocalSecondaryIndexes" ]
        var stackName = path_1.basename(diff.path[1], '.json');
        var tableName = diff.path[3];
        throw new errors_1.InvalidMigrationError("Attempting to add a local secondary index to the " + tableName + " table in the " + stackName + " stack. " +
            'Local secondary indexes must be created when the table is created.', "Adding a @key directive where the first field in 'fields' is the same as the first field in the 'fields' of the primary @key.", "Change the first field in 'fields' such that a global secondary index is created or delete and recreate the model.");
    }
}
exports.cantAddLSILater = cantAddLSILater;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to change GSI KeySchemas after they are created.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
function cantEditGSIKeySchema(diff, currentBuild, nextBuild) {
    function throwError(indexName, stackName, tableName) {
        throw new errors_1.InvalidMigrationError("Attempting to edit the global secondary index " + indexName + " on the " + tableName + " table in the " + stackName + " stack. ", 'The key schema of a global secondary index cannot be changed after being deployed.', 'If using @key, first add a new @key, run `amplify push`, ' +
            'and then remove the old @key. If using @connection, first remove the @connection, run `amplify push`, ' +
            'and then add the new @connection with the new configuration.');
    }
    if (
    // implies a field was changed in a GSI after it was created.
    // Path like:["stacks","Todo.json","Resources","TodoTable","Properties","GlobalSecondaryIndexes",0,"KeySchema",0,"AttributeName"]
    (diff.kind === 'E' && diff.path.length === 10 && diff.path[5] === 'GlobalSecondaryIndexes' && diff.path[7] === 'KeySchema') ||
        // implies a field was added to a GSI after it was created.
        // Path like: [ "stacks", "Comment.json", "Resources", "CommentTable", "Properties", "GlobalSecondaryIndexes", 0, "KeySchema" ]
        (diff.kind === 'A' && diff.path.length === 8 && diff.path[5] === 'GlobalSecondaryIndexes' && diff.path[7] === 'KeySchema')) {
        // This error is symptomatic of a change to the GSI array but does not necessarily imply a breaking change.
        var pathToGSIs = diff.path.slice(0, 6);
        var oldIndexes = get(currentBuild, pathToGSIs);
        var newIndexes = get(nextBuild, pathToGSIs);
        var oldIndexesDiffable = keyBy(oldIndexes, 'IndexName');
        var newIndexesDiffable = keyBy(newIndexes, 'IndexName');
        var innerDiffs = deep_diff_1.diff(oldIndexesDiffable, newIndexesDiffable);
        // We must look at this inner diff or else we could confuse a situation
        // where the user adds a GSI to the beginning of the GlobalSecondaryIndexes list in CFN.
        // We re-key the indexes list so we can determine if a change occured to an index that
        // already exists.
        for (var _i = 0, innerDiffs_1 = innerDiffs; _i < innerDiffs_1.length; _i++) {
            var innerDiff = innerDiffs_1[_i];
            // path: ["AGSI","KeySchema",0,"AttributeName"]
            if (innerDiff.kind === 'E' && innerDiff.path.length > 2 && innerDiff.path[1] === 'KeySchema') {
                var indexName = innerDiff.path[0];
                var stackName = path_1.basename(diff.path[1], '.json');
                var tableName = diff.path[3];
                throwError(indexName, stackName, tableName);
            }
            else if (innerDiff.kind === 'A' && innerDiff.path.length === 2 && innerDiff.path[1] === 'KeySchema') {
                // Path like - ["gsi-PostComments", "KeySchema" ]
                var indexName = innerDiff.path[0];
                var stackName = path_1.basename(diff.path[1], '.json');
                var tableName = diff.path[3];
                throwError(indexName, stackName, tableName);
            }
        }
    }
}
exports.cantEditGSIKeySchema = cantEditGSIKeySchema;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to add and remove GSIs at the same time.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
function cantAddAndRemoveGSIAtSameTime(diff, currentBuild, nextBuild) {
    function throwError(stackName, tableName) {
        throw new errors_1.InvalidMigrationError("Attempting to add and remove a global secondary index at the same time on the " + tableName + " table in the " + stackName + " stack. ", 'You may only change one global secondary index in a single CloudFormation stack update. ', 'If using @key, change one @key at a time. ' +
            'If using @connection, add the new @connection, run `amplify push`, ' +
            'and then remove the new @connection with the new configuration.');
    }
    if (
    // implies a field was changed in a GSI after it was created.
    // Path like:["stacks","Todo.json","Resources","TodoTable","Properties","GlobalSecondaryIndexes", ... ]
    diff.kind === 'E' &&
        diff.path.length > 6 &&
        diff.path[5] === 'GlobalSecondaryIndexes') {
        // This error is symptomatic of a change to the GSI array but does not necessarily imply a breaking change.
        var pathToGSIs = diff.path.slice(0, 6);
        var oldIndexes = get(currentBuild, pathToGSIs);
        var newIndexes = get(nextBuild, pathToGSIs);
        var oldIndexesDiffable = keyBy(oldIndexes, 'IndexName');
        var newIndexesDiffable = keyBy(newIndexes, 'IndexName');
        var innerDiffs = deep_diff_1.diff(oldIndexesDiffable, newIndexesDiffable);
        var sawDelete = false;
        var sawNew = false;
        for (var _i = 0, innerDiffs_2 = innerDiffs; _i < innerDiffs_2.length; _i++) {
            var diff_1 = innerDiffs_2[_i];
            // A path of length 1 means an entire GSI was created or deleted.
            if (diff_1.path.length === 1 && diff_1.kind === 'D') {
                sawDelete = true;
            }
            if (diff_1.path.length === 1 && diff_1.kind === 'N') {
                sawNew = true;
            }
        }
        if (sawDelete && sawNew) {
            var stackName = path_1.basename(diff.path[1], '.json');
            var tableName = diff.path[3];
            throwError(stackName, tableName);
        }
    }
}
exports.cantAddAndRemoveGSIAtSameTime = cantAddAndRemoveGSIAtSameTime;
/**
 * Throws a helpful error when a customer is trying to complete an invalid migration.
 * Users are unable to change LSI KeySchemas after they are created.
 * @param diffs The set of diffs between currentBuild and nextBuild.
 * @param currentBuild The last deployed build.
 * @param nextBuild The next build.
 */
function cantEditLSIKeySchema(diff, currentBuild, nextBuild) {
    if (
    // ["stacks","Todo.json","Resources","TodoTable","Properties","LocalSecondaryIndexes",0,"KeySchema",0,"AttributeName"]
    diff.kind === 'E' &&
        diff.path.length === 10 &&
        diff.path[5] === 'LocalSecondaryIndexes' &&
        diff.path[7] === 'KeySchema') {
        // This error is symptomatic of a change to the GSI array but does not necessarily imply a breaking change.
        var pathToGSIs = diff.path.slice(0, 6);
        var oldIndexes = get(currentBuild, pathToGSIs);
        var newIndexes = get(nextBuild, pathToGSIs);
        var oldIndexesDiffable = keyBy(oldIndexes, 'IndexName');
        var newIndexesDiffable = keyBy(newIndexes, 'IndexName');
        var innerDiffs = deep_diff_1.diff(oldIndexesDiffable, newIndexesDiffable);
        // We must look at this inner diff or else we could confuse a situation
        // where the user adds a LSI to the beginning of the LocalSecondaryIndex list in CFN.
        // We re-key the indexes list so we can determine if a change occured to an index that
        // already exists.
        for (var _i = 0, innerDiffs_3 = innerDiffs; _i < innerDiffs_3.length; _i++) {
            var innerDiff = innerDiffs_3[_i];
            // path: ["AGSI","KeySchema",0,"AttributeName"]
            if (innerDiff.kind === 'E' && innerDiff.path.length > 2 && innerDiff.path[1] === 'KeySchema') {
                var indexName = innerDiff.path[0];
                var stackName = path_1.basename(diff.path[1], '.json');
                var tableName = diff.path[3];
                throw new errors_1.InvalidMigrationError("Attempting to edit the local secondary index " + indexName + " on the " + tableName + " table in the " + stackName + " stack. ", 'The key schema of a local secondary index cannot be changed after being deployed.', 'When enabling new access patterns you should: 1. Add a new @key 2. run amplify push ' +
                    '3. Verify the new access pattern and remove the old @key.');
            }
        }
    }
}
exports.cantEditLSIKeySchema = cantEditLSIKeySchema;
function cantHaveMoreThan200Resources(diffs, currentBuild, nextBuild) {
    var stackKeys = Object.keys(nextBuild.stacks);
    for (var _i = 0, stackKeys_1 = stackKeys; _i < stackKeys_1.length; _i++) {
        var stackName = stackKeys_1[_i];
        var stack = nextBuild.stacks[stackName];
        if (stack && stack.Resources && Object.keys(stack.Resources).length > 200) {
            throw new errors_1.InvalidMigrationError("The " + stackName + " stack defines more than 200 resources.", 'CloudFormation templates may contain at most 200 resources.', 'If the stack is a custom stack, break the stack up into multiple files in stacks/. ' +
                'If the stack was generated, you have hit a limit and can use the StackMapping argument in ' +
                (__1.TRANSFORM_CONFIG_FILE_NAME + " to fine tune how resources are assigned to stacks."));
        }
    }
}
exports.cantHaveMoreThan200Resources = cantHaveMoreThan200Resources;
// Takes a list of object and returns an object keyed by the given attribute.
// This allows us to make more accurate diffs.
function keyBy(objects, attr) {
    return objects.reduce(function (acc, obj) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[obj[attr]] = obj, _a)));
    }, {});
}
function loadDiffableProject(path, rootStackName) {
    return __awaiter(this, void 0, void 0, function () {
        var project, currentStacks, diffableProject, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fileUtils_1.readFromPath(path)];
                case 1:
                    project = _b.sent();
                    currentStacks = project.stacks || {};
                    diffableProject = {
                        stacks: {},
                        root: {},
                    };
                    for (_i = 0, _a = Object.keys(currentStacks); _i < _a.length; _i++) {
                        key = _a[_i];
                        diffableProject.stacks[key] = JSON.parse(project.stacks[key]);
                    }
                    diffableProject.root = JSON.parse(project[rootStackName]);
                    return [2 /*return*/, diffableProject];
            }
        });
    });
}
/**
 * Given an object and a path, get the value from the object at the path.
 * If the full path does not exist, returns undefined.
 * @param obj The object.
 * @param path The path.
 */
function get(obj, path) {
    var tmp = obj;
    for (var _i = 0, path_2 = path; _i < path_2.length; _i++) {
        var part = path_2[_i];
        tmp = tmp[part];
        if (!tmp) {
            return undefined;
        }
    }
    return tmp;
}
//# sourceMappingURL=sanity-check.js.map