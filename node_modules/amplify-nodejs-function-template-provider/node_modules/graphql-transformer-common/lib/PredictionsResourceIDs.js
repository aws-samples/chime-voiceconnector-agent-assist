"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PredictionsResourceIDs = /** @class */ (function () {
    function PredictionsResourceIDs() {
    }
    PredictionsResourceIDs.getPredictionFunctionName = function (action) {
        return action + "Function";
    };
    PredictionsResourceIDs.actionMapID = 'predictionsActionMap';
    PredictionsResourceIDs.iamRole = 'predictionsIAMRole';
    PredictionsResourceIDs.lambdaIAMRole = 'predictionsLambdaIAMRole';
    PredictionsResourceIDs.lambdaName = 'predictionsLambda';
    PredictionsResourceIDs.lambdaID = 'predictionsLambdaFunction';
    PredictionsResourceIDs.lambdaHandlerName = 'predictionsLambda.handler';
    PredictionsResourceIDs.lambdaRuntime = 'nodejs10.x';
    PredictionsResourceIDs.lambdaTimeout = 60;
    return PredictionsResourceIDs;
}());
exports.PredictionsResourceIDs = PredictionsResourceIDs;
//# sourceMappingURL=PredictionsResourceIDs.js.map