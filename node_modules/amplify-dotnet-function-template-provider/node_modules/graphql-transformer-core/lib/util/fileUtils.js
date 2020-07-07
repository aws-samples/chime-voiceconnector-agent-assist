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
var fs = require('fs-extra');
/**
 * Helpers
 */
function emptyDirectory(directory) {
    return __awaiter(this, void 0, void 0, function () {
        var pathExists, dirStats, files, _i, files_1, fileName, fullPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.exists(directory)];
                case 1:
                    pathExists = _a.sent();
                    if (!pathExists) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fs.lstat(directory)];
                case 2:
                    dirStats = _a.sent();
                    if (!dirStats.isDirectory()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fs.readdir(directory)];
                case 3:
                    files = _a.sent();
                    _i = 0, files_1 = files;
                    _a.label = 4;
                case 4:
                    if (!(_i < files_1.length)) return [3 /*break*/, 7];
                    fileName = files_1[_i];
                    fullPath = path.join(directory, fileName);
                    return [4 /*yield*/, fs.remove(fullPath)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.emptyDirectory = emptyDirectory;
function writeToPath(directory, obj) {
    return __awaiter(this, void 0, void 0, function () {
        var i, newDir, _i, _a, key, newDir;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!Array.isArray(obj)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fs.ensureDir(directory)];
                case 1:
                    _b.sent();
                    i = 0;
                    _b.label = 2;
                case 2:
                    if (!(i < obj.length)) return [3 /*break*/, 5];
                    newDir = path.join(directory, "" + i);
                    return [4 /*yield*/, writeToPath(newDir, obj[i])];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 13];
                case 6:
                    if (!(typeof obj === 'object')) return [3 /*break*/, 12];
                    return [4 /*yield*/, fs.ensureDir(directory)];
                case 7:
                    _b.sent();
                    _i = 0, _a = Object.keys(obj);
                    _b.label = 8;
                case 8:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    key = _a[_i];
                    newDir = path.join(directory, key);
                    return [4 /*yield*/, writeToPath(newDir, obj[key])];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 8];
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (typeof obj === 'string') {
                        fs.writeFileSync(directory, obj);
                    }
                    _b.label = 13;
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.writeToPath = writeToPath;
/**
 * Recursively read the contents of a directory into an object.
 * @param directory The directory to read.
 */
function readFromPath(directory) {
    return __awaiter(this, void 0, void 0, function () {
        var pathExists, dirStats, buf, files, accum, _i, files_2, fileName, fullPath, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.exists(directory)];
                case 1:
                    pathExists = _a.sent();
                    if (!pathExists) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fs.lstat(directory)];
                case 2:
                    dirStats = _a.sent();
                    if (!!dirStats.isDirectory()) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs.readFile(directory)];
                case 3:
                    buf = _a.sent();
                    return [2 /*return*/, buf.toString()];
                case 4: return [4 /*yield*/, fs.readdir(directory)];
                case 5:
                    files = _a.sent();
                    accum = {};
                    _i = 0, files_2 = files;
                    _a.label = 6;
                case 6:
                    if (!(_i < files_2.length)) return [3 /*break*/, 9];
                    fileName = files_2[_i];
                    fullPath = path.join(directory, fileName);
                    return [4 /*yield*/, readFromPath(fullPath)];
                case 7:
                    value = _a.sent();
                    accum[fileName] = value;
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: return [2 /*return*/, accum];
            }
        });
    });
}
exports.readFromPath = readFromPath;
/**
 * Uploads a file with exponential backoff up to a point.
 * @param opts The deployment options
 * @param key The bucket key
 * @param body The blob body as a buffer
 * @param backoffMS The time to wait this invocation
 * @param numTries The max number of tries
 */
function handleFile(handler, key, body, backoffMS, numTries) {
    if (backoffMS === void 0) { backoffMS = 500; }
    if (numTries === void 0) { numTries = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, handler({
                            Key: key,
                            Body: body,
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    e_1 = _a.sent();
                    if (!(numTries > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Promise(function (res, rej) { return setTimeout(function () { return res(); }, backoffMS); })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, handleFile(handler, key, body, backoffMS * 2, numTries - 1)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: throw e_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.handleFile = handleFile;
function walkDirRec(dir, handler, relativePath, joinPath) {
    if (relativePath === void 0) { relativePath = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, files_3, file, resourcePath, newRelPath, isDirectory, resourceContents;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readdir(dir)];
                case 1:
                    files = _a.sent();
                    _i = 0, files_3 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_3.length)) return [3 /*break*/, 9];
                    file = files_3[_i];
                    resourcePath = path.join(dir, file);
                    newRelPath = joinPath(relativePath, file);
                    return [4 /*yield*/, fs.lstat(resourcePath)];
                case 3:
                    isDirectory = (_a.sent()).isDirectory();
                    if (!isDirectory) return [3 /*break*/, 5];
                    return [4 /*yield*/, walkDirRec(resourcePath, handler, newRelPath, joinPath)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 5: return [4 /*yield*/, fs.readFile(resourcePath)];
                case 6:
                    resourceContents = _a.sent();
                    return [4 /*yield*/, handleFile(handler, newRelPath, resourceContents)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.walkDirRec = walkDirRec;
function walkDir(dir, handler) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, walkDirRec(dir, handler, '', path.join)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.walkDir = walkDir;
function walkDirPosix(dir, handler) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, walkDirRec(dir, handler, '', path.posix.join)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.walkDirPosix = walkDirPosix;
function throwIfNotJSONExt(stackFile) {
    var extension = path.extname(stackFile);
    if (extension === '.yaml' || extension === '.yml') {
        throw new Error("Yaml is not yet supported. Please convert the CloudFormation stack " + stackFile + " to json.");
    }
    if (extension !== '.json') {
        throw new Error("Invalid extension " + extension + " for stack " + stackFile);
    }
}
exports.throwIfNotJSONExt = throwIfNotJSONExt;
//# sourceMappingURL=fileUtils.js.map