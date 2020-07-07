#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sms = require("source-map-support");
sms.install();
var samData_1 = require("./samData");
var sam2CFNUtils_1 = require("./sam2CFNUtils");
var fs = require("fs");
var process = require("process");
var program = require("commander");
require('colors');
var version = require('../package').version;
program
    .version(version)
    .option('-s, --schema [filepath]', 'input SAM JSON schema file', samData_1.samSchema20161031Filepath)
    .option('-c, --custom-specification [filepath]', 'input CFN overrides file', samData_1.samCustomSpecification20161031Filepath)
    .option('-o, --output [filepath]', 'output CFN file', samData_1.samResources20161031Filepath)
    .parse(process.argv);
// convert and persist the schema
var samSchema = JSON.parse(fs.readFileSync(program.schema, { encoding: 'utf8' }));
var customSpecification = JSON.parse(fs.readFileSync(program.customSpecification, { encoding: 'utf8' }));
fs.writeFileSync(program.output, JSON.stringify(sam2CFNUtils_1.samResourcesSpecification(samSchema, customSpecification)));
console.log('Done.');
//# sourceMappingURL=sam2CFN.js.map