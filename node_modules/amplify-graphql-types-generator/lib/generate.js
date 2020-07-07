"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const loading_1 = require("./loading");
const validation_1 = require("./validation");
const compiler_1 = require("./compiler");
const legacyIR_1 = require("./compiler/legacyIR");
const serializeToJSON_1 = require("./serializeToJSON");
const swift_1 = require("./swift");
const typescript_1 = require("./typescript");
const flow_1 = require("./flow");
const flow_modern_1 = require("./flow-modern");
const scala_1 = require("./scala");
const angular_1 = require("./angular");
const complextypes_1 = require("./utilities/complextypes");
function generate(inputPaths, schemaPath, outputPath, only, target, tagName, options) {
    const schema = loading_1.loadSchema(schemaPath);
    const document = loading_1.loadAndMergeQueryDocuments(inputPaths, tagName);
    validation_1.validateQueryDocument(schema, document);
    if (target === 'swift') {
        options.addTypename = true;
        const context = compiler_1.compileToIR(schema, document, options);
        if (options.complexObjectSupport === 'auto') {
            options.addS3Wrapper = context.typesUsed.some(typesUsed => complextypes_1.hasS3Fields(typesUsed));
        }
        else if (options.complexObjectSupport === 'yes') {
            options.addS3Wrapper = true;
        }
        else {
            options.addS3Wrapper = false;
        }
        const outputIndividualFiles = fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory();
        const generator = swift_1.generateSource(context, outputIndividualFiles, only);
        if (outputIndividualFiles) {
            writeGeneratedFiles(generator.generatedFiles, outputPath);
        }
        else {
            fs.writeFileSync(outputPath, generator.output);
        }
    }
    else if (target === 'flow-modern') {
        const context = compiler_1.compileToIR(schema, document, options);
        const generatedFiles = flow_modern_1.generateSource(context);
        const filesByOutputDirectory = {};
        Object.keys(generatedFiles).forEach((filePath) => {
            const outputDirectory = path.dirname(filePath);
            if (!filesByOutputDirectory[outputDirectory]) {
                filesByOutputDirectory[outputDirectory] = {
                    [path.basename(filePath)]: generatedFiles[filePath],
                };
            }
            else {
                filesByOutputDirectory[outputDirectory][path.basename(filePath)] = generatedFiles[filePath];
            }
        });
        Object.keys(filesByOutputDirectory).forEach(outputDirectory => {
            writeGeneratedFiles(filesByOutputDirectory[outputDirectory], outputDirectory);
        });
    }
    else {
        let output;
        const context = legacyIR_1.compileToLegacyIR(schema, document, options);
        switch (target) {
            case 'json':
                output = serializeToJSON_1.default(context);
                break;
            case 'ts':
            case 'typescript':
                output = typescript_1.generateSource(context);
                break;
            case 'flow':
                output = flow_1.generateSource(context);
                break;
            case 'scala':
                output = scala_1.generateSource(context, options);
                break;
            case 'angular':
                output = angular_1.generateSource(context);
        }
        if (outputPath) {
            fs.writeFileSync(outputPath, output);
        }
        else {
            console.log(output);
        }
    }
}
exports.default = generate;
function writeGeneratedFiles(generatedFiles, outputDirectory) {
    rimraf.sync(outputDirectory);
    fs.mkdirSync(outputDirectory);
    for (const [fileName, generatedFile] of Object.entries(generatedFiles)) {
        fs.writeFileSync(path.join(outputDirectory, fileName), generatedFile.output);
    }
}
//# sourceMappingURL=generate.js.map