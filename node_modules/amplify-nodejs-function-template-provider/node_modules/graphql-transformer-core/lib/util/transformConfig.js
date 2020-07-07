"use strict";
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
var path = require("path");
var fileUtils_1 = require("./fileUtils");
var fs = require('fs-extra');
exports.TRANSFORM_CONFIG_FILE_NAME = "transform.conf.json";
exports.TRANSFORM_BASE_VERSION = 4;
exports.TRANSFORM_CURRENT_VERSION = 5;
/**
 * try to load transformer config from specified projectDir
 * if it does not exist then we return a blank object
 *  */
function loadConfig(projectDir) {
    return __awaiter(this, void 0, void 0, function () {
        var config, configPath, configExists, configStr, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        Version: exports.TRANSFORM_CURRENT_VERSION,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    configPath = path.join(projectDir, exports.TRANSFORM_CONFIG_FILE_NAME);
                    return [4 /*yield*/, fs.exists(configPath)];
                case 2:
                    configExists = _a.sent();
                    if (!configExists) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs.readFile(configPath)];
                case 3:
                    configStr = _a.sent();
                    config = JSON.parse(configStr.toString());
                    _a.label = 4;
                case 4: return [2 /*return*/, config];
                case 5:
                    err_1 = _a.sent();
                    return [2 /*return*/, config];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.loadConfig = loadConfig;
function writeConfig(projectDir, config) {
    return __awaiter(this, void 0, void 0, function () {
        var configFilePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    configFilePath = path.join(projectDir, exports.TRANSFORM_CONFIG_FILE_NAME);
                    return [4 /*yield*/, fs.writeFile(configFilePath, JSON.stringify(config, null, 4))];
                case 1:
                    _a.sent();
                    return [2 /*return*/, config];
            }
        });
    });
}
exports.writeConfig = writeConfig;
function loadProject(projectDirectory, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var schema, resolvers, resolverDirectory, resolverDirExists, resolverFiles, _i, resolverFiles_1, resolverFile, resolverFilePath, _a, _b, stacksDirectory, stacksDirExists, stacks, stackFiles, _c, stackFiles_1, stackFile, stackFilePath, stackBuffer, config;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, readSchema(projectDirectory)];
                case 1:
                    schema = _d.sent();
                    resolvers = {};
                    if (!!(opts && opts.disableResolverOverrides === true)) return [3 /*break*/, 7];
                    resolverDirectory = path.join(projectDirectory, 'resolvers');
                    return [4 /*yield*/, fs.exists(resolverDirectory)];
                case 2:
                    resolverDirExists = _d.sent();
                    if (!resolverDirExists) return [3 /*break*/, 7];
                    return [4 /*yield*/, fs.readdir(resolverDirectory)];
                case 3:
                    resolverFiles = _d.sent();
                    _i = 0, resolverFiles_1 = resolverFiles;
                    _d.label = 4;
                case 4:
                    if (!(_i < resolverFiles_1.length)) return [3 /*break*/, 7];
                    resolverFile = resolverFiles_1[_i];
                    if (resolverFile.indexOf('.') === 0) {
                        return [3 /*break*/, 6];
                    }
                    resolverFilePath = path.join(resolverDirectory, resolverFile);
                    _a = resolvers;
                    _b = resolverFile;
                    return [4 /*yield*/, fs.readFile(resolverFilePath)];
                case 5:
                    _a[_b] = _d.sent();
                    _d.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    stacksDirectory = path.join(projectDirectory, 'stacks');
                    return [4 /*yield*/, fs.exists(stacksDirectory)];
                case 8:
                    stacksDirExists = _d.sent();
                    stacks = {};
                    if (!stacksDirExists) return [3 /*break*/, 13];
                    return [4 /*yield*/, fs.readdir(stacksDirectory)];
                case 9:
                    stackFiles = _d.sent();
                    _c = 0, stackFiles_1 = stackFiles;
                    _d.label = 10;
                case 10:
                    if (!(_c < stackFiles_1.length)) return [3 /*break*/, 13];
                    stackFile = stackFiles_1[_c];
                    if (stackFile.indexOf('.') === 0) {
                        return [3 /*break*/, 12];
                    }
                    stackFilePath = path.join(stacksDirectory, stackFile);
                    fileUtils_1.throwIfNotJSONExt(stackFile);
                    return [4 /*yield*/, fs.readFile(stackFilePath)];
                case 11:
                    stackBuffer = _d.sent();
                    try {
                        stacks[stackFile] = JSON.parse(stackBuffer.toString());
                    }
                    catch (e) {
                        throw new Error("The CloudFormation template " + stackFiles + " does not contain valid JSON.");
                    }
                    _d.label = 12;
                case 12:
                    _c++;
                    return [3 /*break*/, 10];
                case 13: return [4 /*yield*/, loadConfig(projectDirectory)];
                case 14:
                    config = _d.sent();
                    return [2 /*return*/, {
                            stacks: stacks,
                            resolvers: resolvers,
                            schema: schema,
                            config: config,
                        }];
            }
        });
    });
}
exports.loadProject = loadProject;
/**
 * Given a project directory read the schema from disk. The schema may be a
 * single schema.graphql or a set of .graphql files in a directory named `schema`.
 * Preference is given to the `schema.graphql` if provided.
 * @param projectDirectory The project directory.
 */
function readSchema(projectDirectory) {
    return __awaiter(this, void 0, void 0, function () {
        var schemaFilePath, schemaDirectoryPath, schemaFileExists, schemaDirectoryExists, schema;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    schemaFilePath = path.join(projectDirectory, 'schema.graphql');
                    schemaDirectoryPath = path.join(projectDirectory, 'schema');
                    return [4 /*yield*/, fs.exists(schemaFilePath)];
                case 1:
                    schemaFileExists = _a.sent();
                    return [4 /*yield*/, fs.exists(schemaDirectoryPath)];
                case 2:
                    schemaDirectoryExists = _a.sent();
                    if (!schemaFileExists) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs.readFile(schemaFilePath)];
                case 3:
                    schema = (_a.sent()).toString();
                    return [3 /*break*/, 7];
                case 4:
                    if (!schemaDirectoryExists) return [3 /*break*/, 6];
                    return [4 /*yield*/, readSchemaDocuments(schemaDirectoryPath)];
                case 5:
                    schema = (_a.sent()).join('\n');
                    return [3 /*break*/, 7];
                case 6: throw new Error("Could not find a schema at " + schemaFilePath);
                case 7: return [2 /*return*/, schema];
            }
        });
    });
}
exports.readSchema = readSchema;
function readSchemaDocuments(schemaDirectoryPath) {
    return __awaiter(this, void 0, void 0, function () {
        var files, schemaDocuments, _i, files_1, fileName, fullPath, stats, childDocs, schemaDoc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readdir(schemaDirectoryPath)];
                case 1:
                    files = _a.sent();
                    schemaDocuments = [];
                    _i = 0, files_1 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 8];
                    fileName = files_1[_i];
                    if (fileName.indexOf('.') === 0) {
                        return [3 /*break*/, 7];
                    }
                    fullPath = schemaDirectoryPath + "/" + fileName;
                    return [4 /*yield*/, fs.lstat(fullPath)];
                case 3:
                    stats = _a.sent();
                    if (!stats.isDirectory()) return [3 /*break*/, 5];
                    return [4 /*yield*/, readSchemaDocuments(fullPath)];
                case 4:
                    childDocs = _a.sent();
                    schemaDocuments = schemaDocuments.concat(childDocs);
                    return [3 /*break*/, 7];
                case 5:
                    if (!stats.isFile()) return [3 /*break*/, 7];
                    return [4 /*yield*/, fs.readFile(fullPath)];
                case 6:
                    schemaDoc = _a.sent();
                    schemaDocuments.push(schemaDoc);
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [2 /*return*/, schemaDocuments];
            }
        });
    });
}
//# sourceMappingURL=transformConfig.js.map