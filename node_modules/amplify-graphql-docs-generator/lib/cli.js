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
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const path = require("path");
const logger_1 = require("./logger");
const index_1 = require("./index");
// / Make sure unhandled errors in async code are propagated correctly
process.on('unhandledRejection', error => {
    throw error;
});
process.on('uncaughtException', handleError);
function handleError(error) {
    logger_1.logError(error);
    process.exit(1);
}
function run(argv) {
    // tslint:disable
    yargs
        .command('$0', 'Generate graphql operations for the provided introspection schema', {
        schema: {
            demand: true,
            describe: 'Path introspection schema',
            default: 'schema.json',
            normalize: true,
            coerce: path.resolve,
        },
        output: {
            demand: true,
            default: 'all-operations.graphql',
            normalize: true,
            coerce: path.resolve,
        },
        language: {
            demand: true,
            default: 'graphql',
            normalize: true,
            choices: ['graphql', 'javascript', 'flow', 'typescript'],
        },
        maxDepth: {
            demand: true,
            default: 2,
            normalize: true,
            type: 'number',
        },
        separateFiles: {
            default: false,
            type: 'boolean',
        },
    }, (argv) => __awaiter(this, void 0, void 0, function* () {
        index_1.generate(argv.schema, argv.output, { separateFiles: argv.separateFiles, language: argv.language, maxDepth: argv.maxDepth });
    }))
        .help()
        .version()
        .strict().argv;
}
exports.run = run;
//# sourceMappingURL=cli.js.map