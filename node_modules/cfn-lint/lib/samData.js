"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sms = require("source-map-support");
sms.install();
exports.samPrimitiveTypes = ['string', 'number', 'boolean'];
exports.samSchema20161031Filepath = '../data/sam_20161031_schema.json';
exports.samSchema20161031 = require(exports.samSchema20161031Filepath);
exports.samImplicitResources20161031Filepath = '../data/sam_20161031_output_resources.json';
exports.samImplicitResources20161031 = require(exports.samImplicitResources20161031Filepath);
exports.samCustomSpecification20161031Filepath = '../data/sam_20161031_custom_specification.json';
exports.samCustomSpecification20161031 = require(exports.samCustomSpecification20161031Filepath);
exports.samResources20161031Filepath = '../data/sam_20161031_cfn.json';
exports.samResources20161031 = require(exports.samResources20161031Filepath);
exports.samGlobals20161031Filepath = '../data/sam_20161031_globals.json';
exports.samGlobals20161031 = require(exports.samGlobals20161031Filepath);
//# sourceMappingURL=samData.js.map