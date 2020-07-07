"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var expect = chai.expect;
var childProcess = require("child_process");
var exec = childProcess.exec;
var proxyquire = require('proxyquire-2').noPreserveCache();
var realProcessARGV = null;
var realProcessExit = null;
var logToConsole = true;
var _log = console.log;
console.log = function () {
    if (logToConsole) {
        return _log.apply(this, arguments);
    }
};
var _err = console.error;
console.error = function () {
    if (logToConsole) {
        return _err.apply(this, arguments);
    }
};
describe('sam2CFN', function () {
    describe('CLI - unit tests', function () {
        beforeEach(function () {
            realProcessARGV = process.argv;
            realProcessExit = process.exit;
            logToConsole = false;
        });
        afterEach(function () {
            process.argv = realProcessARGV;
            process.exit = realProcessExit;
            logToConsole = true;
        });
        it('should be able to correctly process valid parameters', function (done) {
            process.exit = function () { return undefined; };
            process.argv = ['', '', '-s', 'somethingCool', '-c', 'somethingAwesome', '-o', 'somethingBeautiful'];
            var expectedReadFileSync = [
                { x: 'somethingCool', y: { encoding: 'utf8' } },
                { x: 'somethingAwesome', y: { encoding: 'utf8' } }
            ];
            var mockedReadFileSync = [
                '{}',
                '{}'
            ];
            proxyquire('../sam2CFN', {
                'fs': {
                    readFileSync: function (x, y) {
                        logToConsole = true;
                        var expected = expectedReadFileSync.shift();
                        expect(x).to.equal(expected['x']);
                        expect(y).to.deep.equal(expected['y']);
                        logToConsole = false;
                        return mockedReadFileSync.shift();
                    },
                    writeFileSync: function (x, y) {
                        logToConsole = true;
                        expect(x).to.equal('somethingBeautiful');
                        expect(y).to.equal('{}');
                        done();
                        logToConsole = false;
                    },
                    '@global': true
                },
                './sam2CFNUtils': {
                    samResourcesSpecification: function (x, y) { return {}; }
                }
            });
        }).timeout(5000);
    });
});
//# sourceMappingURL=sam2CFNTest.js.map