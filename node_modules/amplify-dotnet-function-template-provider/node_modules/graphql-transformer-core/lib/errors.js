"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var InvalidTransformerError = /** @class */ (function (_super) {
    __extends(InvalidTransformerError, _super);
    function InvalidTransformerError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, InvalidTransformerError.prototype);
        _this.name = 'InvalidTransformerError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, InvalidTransformerError);
        }
        return _this;
    }
    return InvalidTransformerError;
}(Error));
exports.InvalidTransformerError = InvalidTransformerError;
var SchemaValidationError = /** @class */ (function (_super) {
    __extends(SchemaValidationError, _super);
    function SchemaValidationError(errors) {
        var _this = _super.call(this, "Schema Errors:\n\n" + errors.join('\n')) || this;
        Object.setPrototypeOf(_this, SchemaValidationError.prototype);
        _this.name = 'SchemaValidationError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, SchemaValidationError);
        }
        return _this;
    }
    return SchemaValidationError;
}(Error));
exports.SchemaValidationError = SchemaValidationError;
/**
 * Thrown by transformers when a user provided schema breaks some contract expected by the transformer.
 *
 * A contract issue is one that is not incorrect GraphQL but that violates
 * the semantics or contract required by the business logic of a transformer.
 * For example, the @versioned directive requires the provided "versionField" to be
 * of an Int or BigInt type.
 */
var TransformerContractError = /** @class */ (function (_super) {
    __extends(TransformerContractError, _super);
    function TransformerContractError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, TransformerContractError.prototype);
        _this.name = 'TransformerContractError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, TransformerContractError);
        }
        return _this;
    }
    return TransformerContractError;
}(Error));
exports.TransformerContractError = TransformerContractError;
/**
 * Thrown by the sanity checker when a user is trying to make a migration that is known to not work.
 */
var InvalidMigrationError = /** @class */ (function (_super) {
    __extends(InvalidMigrationError, _super);
    function InvalidMigrationError(message, cause, fix) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, InvalidMigrationError.prototype);
        _this.name = 'InvalidMigrationError';
        _this.fix = fix;
        _this.cause = cause;
        return _this;
    }
    return InvalidMigrationError;
}(Error));
exports.InvalidMigrationError = InvalidMigrationError;
InvalidMigrationError.prototype.toString = function () {
    return this.message + "\nCause: " + this.cause + "\nHow to fix: " + this.fix;
};
var InvalidDirectiveError = /** @class */ (function (_super) {
    __extends(InvalidDirectiveError, _super);
    function InvalidDirectiveError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, InvalidDirectiveError.prototype);
        _this.name = 'InvalidDirectiveError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, InvalidDirectiveError);
        }
        return _this;
    }
    return InvalidDirectiveError;
}(Error));
exports.InvalidDirectiveError = InvalidDirectiveError;
var UnknownDirectiveError = /** @class */ (function (_super) {
    __extends(UnknownDirectiveError, _super);
    function UnknownDirectiveError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, UnknownDirectiveError.prototype);
        _this.name = 'UnknownDirectiveError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, UnknownDirectiveError);
        }
        return _this;
    }
    return UnknownDirectiveError;
}(Error));
exports.UnknownDirectiveError = UnknownDirectiveError;
//# sourceMappingURL=errors.js.map