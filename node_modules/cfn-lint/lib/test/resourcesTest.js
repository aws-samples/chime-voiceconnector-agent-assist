"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var resourceSpec = require("../resourcesSpec");
describe('resourceSpec', function () {
    describe('getType', function () {
        it('should return a resource type', function () {
            var result = resourceSpec.getType("AWS::Lambda::Function");
            expect(result).to.not.equal(null);
        });
        it('should return a property type', function () {
            var result = resourceSpec.getType("AWS::Lambda::Function.Code");
            expect(result).to.not.equal(null);
        });
        it('should throw for invalid type', function () {
            expect(function () { return resourceSpec.getType("AWS::Lambda::InvalidFunction"); }).to.throw(resourceSpec.NoSuchResourceType);
        });
    });
    describe('isValidProperty', function () {
        it('should return True for AWS::Lambda::Function > Code', function () {
            var result = resourceSpec.isValidProperty("AWS::Lambda::Function", "Code");
            expect(result).to.equal(true);
        });
        it('should return False for AWS::Lambda::Function > MyCode', function () {
            var result = resourceSpec.isValidProperty("AWS::Lambda::Function", "MyCode");
            expect(result).to.equal(false);
        });
        it('should throw for AWS::Lambda::InvalidFunction > Code', function () {
            expect(function () { return resourceSpec.isValidProperty("AWS::Lambda::InvalidFunction", "Code"); }).to.throw(resourceSpec.NoSuchResourceType);
        });
    });
    describe('isRequiredProperty', function () {
        it('should return True for AWS::IAM::User.Policy > PolicyName', function () {
            var result = resourceSpec.isRequiredProperty("AWS::IAM::User.Policy", "PolicyName");
            expect(result).to.equal(true);
        });
        it('should return True for AWS::Lambda::Function > Code', function () {
            var result = resourceSpec.isRequiredProperty("AWS::Lambda::Function", "Code");
            expect(result).to.equal(true);
        });
        it('should return False for AWS::Lambda::Function > Description', function () {
            var result = resourceSpec.isRequiredProperty("AWS::Lambda::Function", "Description");
            expect(result).to.equal(false);
        });
        it('should throw for AWS::Lambda::InvalidFunction > Description', function () {
            expect(function () { return resourceSpec.isRequiredProperty("AWS::Lambda::InvalidFunction", "Description"); }).to.throw(resourceSpec.NoSuchResourceType);
        });
    });
    describe('isSinglePrimitivePropertyType', function () {
        it('should return True for AWS::Lambda::Function > Description', function () {
            var result = resourceSpec.isPrimitiveProperty("AWS::Lambda::Function", "Description");
            expect(result).to.equal(true);
        });
        it('should return False for AWS::Lambda::Function > Code', function () {
            var result = resourceSpec.isPrimitiveProperty("AWS::Lambda::Function", "Code");
            expect(result).to.equal(false);
        });
        it('should return False for AWS::Lambda::InvalidFunction > Code', function () {
            expect(function () { return resourceSpec.isPrimitiveProperty("AWS::Lambda::InvalidFunction", "Code"); }).to.throw(resourceSpec.NoSuchResourceType);
        });
    });
    describe('isArnProperty', function () {
        it('should return True for KmsKeyArn', function () {
            var result = resourceSpec.isArnProperty("KmsKeyArn");
            expect(result).to.equal(true);
        });
        // TODO: Check for ARNs
        it('should return True for TopicArn', function () {
            var result = resourceSpec.isArnProperty("TopicArn");
            expect(result).to.equal(true);
        });
        it('should return False for Code', function () {
            var result = resourceSpec.isArnProperty("Code");
            expect(result).to.equal(false);
        });
    });
    describe('getRefOverride', function () {
        it('should return "arn" for AWS::ECS::Service', function () {
            var result = resourceSpec.getRefOverride("AWS::ECS::Service");
            expect(result).to.equal("arn");
        });
        it('should return null for AWS::Lambda::Function', function () {
            var result = resourceSpec.getRefOverride("AWS::Lambda::Function");
            expect(result).to.equal(null);
        });
    });
    describe('getResourceTypeAttribute', function () {
        it('should return "String" for AWS::ECS::Service attribute Name', function () {
            var result = resourceSpec.getResourceTypeAttribute("AWS::ECS::Service", "Name");
            var res = result;
            expect(res.PrimitiveType).to.equal("String");
        });
        it('should return "List of String" for AWS::Route53::HostedZone attribute NameServers', function () {
            var result = resourceSpec.getResourceTypeAttribute("AWS::Route53::HostedZone", "NameServers");
            var res = result;
            expect(res.Type).to.equal("List");
            expect(res.PrimitiveItemType).to.equal("String");
        });
        it('should throw NoSuchResourceTypeAttribute for any attrbute on a type with no attributes', function () {
            expect(function () { return resourceSpec.getResourceTypeAttribute("AWS::CloudFormation::WaitConditionHandle", "Anything"); }).to.throw(resourceSpec.NoSuchResourceTypeAttribute);
        });
        it('should throw NoSuchResourceTypeAttribute for an attrbute that does not exist on a type', function () {
            expect(function () { return resourceSpec.getResourceTypeAttribute("AWS::ECS::Service", "AttributeThatDoesNotExist"); }).to.throw(resourceSpec.NoSuchResourceTypeAttribute);
        });
    });
    describe('type utilities', function () {
        describe('isParameterizedTypeFormat', function () {
            it('should recognize a non-parameterized Resource-type', function () {
                var input = 'AWS::S3::Bucket';
                var result = resourceSpec.isParameterizedTypeFormat(input);
                expect(result).to.equal(false);
            });
            it('should recognize a non-parameterized Property-type', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.isParameterizedTypeFormat(input);
                expect(result).to.equal(false);
            });
            it('should recognize a parameterized Resource-type', function () {
                var input = 'AWS::S3::Bucket<String>';
                var result = resourceSpec.isParameterizedTypeFormat(input);
                expect(result).to.equal(true);
            });
            it('should recognize a parameterized Property-type', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts<String>';
                var result = resourceSpec.isParameterizedTypeFormat(input);
                expect(result).to.equal(true);
            });
            it('should recognize a parameterized Resource-type, with nested parameterization', function () {
                var input = 'AWS::S3::Bucket<AWS::CodeBuild::Project.Artifacts<String>>';
                var result = resourceSpec.isParameterizedTypeFormat(input);
                expect(result).to.equal(true);
            });
            it('should recognize a parameterized Property-type, with nested parameterization', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts<AWS::S3::Bucket<String>>';
                var result = resourceSpec.isParameterizedTypeFormat(input);
                expect(result).to.equal(true);
            });
        });
        describe('getParameterizedTypeArgument', function () {
            it('should throw an error if the provided Resource-type is not parameterized', function () {
                var input = 'AWS::S3::Bucket';
                var result = function () { resourceSpec.getParameterizedTypeArgument(input); };
                expect(result).to.throw('Invalid parameterized type: AWS::S3::Bucket');
            });
            it('should throw an error if the provided Property-type is not parameterized', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts';
                var result = function () { resourceSpec.getParameterizedTypeArgument(input); };
                expect(result).to.throw('Invalid parameterized type: AWS::CodeBuild::Project.Artifacts');
            });
            it('should return the argument of a parameterized Resource-type', function () {
                var input = 'AWS::S3::Bucket<somethingBeautiful>';
                var result = resourceSpec.getParameterizedTypeArgument(input);
                expect(result).to.equal('somethingBeautiful');
            });
            it('should return the argument of a parameterized Property-type', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts<somethingBeautiful>';
                var result = resourceSpec.getParameterizedTypeArgument(input);
                expect(result).to.equal('somethingBeautiful');
            });
            it('should return the argument of a parameterized Resource-type, with nested parameterization', function () {
                var input = 'AWS::S3::Bucket<AWS::CodeBuild::Project.Artifacts<String>>';
                var result = resourceSpec.getParameterizedTypeArgument(input);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts<String>');
            });
            it('should return the argument of a parameterized Property-type, with nested parameterization', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts<AWS::S3::Bucket<String>>';
                var result = resourceSpec.getParameterizedTypeArgument(input);
                expect(result).to.equal('AWS::S3::Bucket<String>');
            });
        });
        describe('getParameterizedTypeName', function () {
            it('should throw an error if the provided Resource-type is not parameterized', function () {
                var input = 'AWS::S3::Bucket';
                var result = function () { resourceSpec.getParameterizedTypeName(input); };
                expect(result).to.throw('Invalid parameterized type: AWS::S3::Bucket');
            });
            it('should throw an error if the provided Property-type is not parameterized', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts';
                var result = function () { resourceSpec.getParameterizedTypeName(input); };
                expect(result).to.throw('Invalid parameterized type: AWS::CodeBuild::Project.Artifacts');
            });
            it('should return the name of a parameterized Resource-type', function () {
                var input = 'AWS::S3::Bucket<somethingBeautiful>';
                var result = resourceSpec.getParameterizedTypeName(input);
                expect(result).to.equal('AWS::S3::Bucket');
            });
            it('should return the name of a parameterized Property-type', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts<somethingBeautiful>';
                var result = resourceSpec.getParameterizedTypeName(input);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts');
            });
            it('should return the name of a parameterized Resource-type, with nested parameterization', function () {
                var input = 'AWS::S3::Bucket<AWS::CodeBuild::Project.Artifacts<String>>';
                var result = resourceSpec.getParameterizedTypeName(input);
                expect(result).to.equal('AWS::S3::Bucket');
            });
            it('should return the name of a parameterized Property-type, with nested parameterization', function () {
                var input = 'AWS::CodeBuild::Project.Artifacts<AWS::S3::Bucket<String>>';
                var result = resourceSpec.getParameterizedTypeName(input);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts');
            });
        });
        describe('parameterizeTypeFormat', function () {
            it('should parameterize a Resource-type that is not already parameterized', function () {
                var inputType = 'AWS::S3::Bucket';
                var inputParameter = 'somethingBeautiful';
                var inputAllowSubParameterization = false;
                var result = resourceSpec.parameterizeTypeFormat(inputType, inputParameter, inputAllowSubParameterization);
                expect(result).to.equal('AWS::S3::Bucket<somethingBeautiful>');
            });
            it('should parameterize a Property-type that is not already parameterized', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var inputParameter = 'somethingBeautiful';
                var inputAllowSubParameterization = false;
                var result = resourceSpec.parameterizeTypeFormat(inputType, inputParameter, inputAllowSubParameterization);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts<somethingBeautiful>');
            });
            it('should throw an error if the provided Resource-type is already parameterized and sub-parameterization is disallowed', function () {
                var inputType = 'AWS::S3::Bucket<String>';
                var inputParameter = 'somethingBeautiful';
                var inputAllowSubParameterization = false;
                var result = function () { resourceSpec.parameterizeTypeFormat(inputType, inputParameter, inputAllowSubParameterization); };
                expect(result).to.throw('Type is already parameterized: AWS::S3::Bucket<String>');
            });
            it('should throw an error if the provided Property-type is already parameterized and sub-parameterization is disallowed', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var inputParameter = 'somethingBeautiful';
                var inputAllowSubParameterization = false;
                var result = function () { resourceSpec.parameterizeTypeFormat(inputType, inputParameter, inputAllowSubParameterization); };
                expect(result).to.throw('Type is already parameterized: AWS::CodeBuild::Project.Artifacts<String>');
            });
            it('should parameterize a Resource-type that is already parameterized when sub-parameterization is allowed', function () {
                var inputType = 'AWS::S3::Bucket<String>';
                var inputParameter = 'somethingBeautiful';
                var inputAllowSubParameterization = true;
                var result = resourceSpec.parameterizeTypeFormat(inputType, inputParameter, inputAllowSubParameterization);
                expect(result).to.equal('AWS::S3::Bucket<String<somethingBeautiful>>');
            });
            it('should parameterize a Property-type that is already parameterized when sub-parameterization is allowed', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var inputParameter = 'somethingBeautiful';
                var inputAllowSubParameterization = true;
                var result = resourceSpec.parameterizeTypeFormat(inputType, inputParameter, inputAllowSubParameterization);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts<String<somethingBeautiful>>');
            });
        });
        describe('stripTypeParameters', function () {
            it('should be nullipotent on a Resource-type that is not already parameterized', function () {
                var inputType = 'AWS::S3::Bucket';
                var result = resourceSpec.stripTypeParameters(inputType);
                expect(result).to.equal('AWS::S3::Bucket');
            });
            it('should be nullipotent on a Property-type that is not already parameterized', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.stripTypeParameters(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts');
            });
            it('should strip parameterization of a Resource-type that is parameterized', function () {
                var inputType = 'AWS::S3::Bucket<String>';
                var result = resourceSpec.stripTypeParameters(inputType);
                expect(result).to.equal('AWS::S3::Bucket');
            });
            it('should strip parameterization of a Property-type that is parameterized', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var result = resourceSpec.stripTypeParameters(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts');
            });
            it('should strip parameterization of a Resource-type that is sub-parameterized', function () {
                var inputType = 'AWS::S3::Bucket<String<somethingBeautiful>>';
                var result = resourceSpec.stripTypeParameters(inputType);
                expect(result).to.equal('AWS::S3::Bucket');
            });
            it('should strip parameterization of a Property-type that is sub-parameterized', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String<somethingBeautiful>>';
                var result = resourceSpec.stripTypeParameters(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts');
            });
        });
        describe('getPropertyTypeBaseName', function () {
            it('should throw an error on a non Property-type', function () {
                var inputType = 'AWS::S3::Bucket';
                var result = function () { resourceSpec.getPropertyTypeBaseName(inputType); };
                expect(result).to.throw('Invalid property type name: AWS::S3::Bucket');
            });
            it('should return the base type of a Property-type', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.getPropertyTypeBaseName(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project');
            });
            it('should return the base type of a Property-type that has a parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var result = resourceSpec.getPropertyTypeBaseName(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project');
            });
            it('should return the base type of a Property-type that has a parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String>.Artifacts';
                var result = resourceSpec.getPropertyTypeBaseName(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project<String>');
            });
            it('should return the base type of a Property-type that has a sub-parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String<somethingBeautiful>>';
                var result = resourceSpec.getPropertyTypeBaseName(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project');
            });
            it('should return the base type of a Property-type that has a sub-parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String<somethingBeautiful>>.Artifacts';
                var result = resourceSpec.getPropertyTypeBaseName(inputType);
                expect(result).to.equal('AWS::CodeBuild::Project<String<somethingBeautiful>>');
            });
        });
        describe('getPropertyTypePropertyName', function () {
            it('should throw an error on a non Property-type', function () {
                var inputType = 'AWS::S3::Bucket';
                var result = function () { resourceSpec.getPropertyTypePropertyName(inputType); };
                expect(result).to.throw('Invalid property type name: AWS::S3::Bucket');
            });
            it('should return the property name of a Property-type', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.getPropertyTypePropertyName(inputType);
                expect(result).to.equal('Artifacts');
            });
            it('should return the property name of a Property-type that has a parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var result = resourceSpec.getPropertyTypePropertyName(inputType);
                expect(result).to.equal('Artifacts<String>');
            });
            it('should return the property name of a Property-type that has a parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String>.Artifacts';
                var result = resourceSpec.getPropertyTypePropertyName(inputType);
                expect(result).to.equal('Artifacts');
            });
            it('should return the property name of a Property-type that has a sub-parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String<somethingBeautiful>>';
                var result = resourceSpec.getPropertyTypePropertyName(inputType);
                expect(result).to.equal('Artifacts<String<somethingBeautiful>>');
            });
            it('should return the property name of a Property-type that has a sub-parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String<somethingBeautiful>>.Artifacts';
                var result = resourceSpec.getPropertyTypePropertyName(inputType);
                expect(result).to.equal('Artifacts');
            });
        });
        describe('isTypeFormat', function () {
            it('should return false for an invalid type', function () {
                var inputType = 'somethingCool';
                var result = resourceSpec.isTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return true for a valid Resource-type', function () {
                var inputType = 'AWS::CodeBuild::Project';
                var result = resourceSpec.isTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.isTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var result = resourceSpec.isTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String>.Artifacts';
                var result = resourceSpec.isTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a sub-parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String<somethingBeautiful>>';
                var result = resourceSpec.isTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a sub-parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String<somethingBeautiful>>.Artifacts';
                var result = resourceSpec.isTypeFormat(inputType);
                expect(result).to.equal(true);
            });
        });
        describe('isPropertyTypeFormat', function () {
            it('should return false for an invalid type', function () {
                var inputType = 'somethingCool';
                var result = resourceSpec.isPropertyTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return false for a valid Resource-type', function () {
                var inputType = 'AWS::CodeBuild::Project';
                var result = resourceSpec.isPropertyTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return true for a valid Property-type', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.isPropertyTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var result = resourceSpec.isPropertyTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String>.Artifacts';
                var result = resourceSpec.isPropertyTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a sub-parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String<somethingBeautiful>>';
                var result = resourceSpec.isPropertyTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid Property-type that has a sub-parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String<somethingBeautiful>>.Artifacts';
                var result = resourceSpec.isPropertyTypeFormat(inputType);
                expect(result).to.equal(true);
            });
        });
        describe('isResourceTypeFormat', function () {
            it('should return false for an invalid type', function () {
                var inputType = 'somethingCool';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return false for a valid Property-type', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return true for a valid Resource-type', function () {
                var inputType = 'AWS::CodeBuild::Project';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid parameterized Resource-type', function () {
                var inputType = 'AWS::CodeBuild::Project<String>';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return true for a valid sub-parameterized Resource-type', function () {
                var inputType = 'AWS::CodeBuild::Project<String<somethingAwesome>>';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(true);
            });
            it('should return false for a valid Property-type that has a parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String>';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return false for a valid Property-type that has a parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String>.Artifacts';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return false for a valid Property-type that has a sub-parameterized property name', function () {
                var inputType = 'AWS::CodeBuild::Project.Artifacts<String<somethingBeautiful>>';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(false);
            });
            it('should return false for a valid Property-type that has a sub-parameterized base name', function () {
                var inputType = 'AWS::CodeBuild::Project<String<somethingBeautiful>>.Artifacts';
                var result = resourceSpec.isResourceTypeFormat(inputType);
                expect(result).to.equal(false);
            });
        });
        describe('rebaseTypeFormat', function () {
            it('should return the primitive value type, given a Resource-type and an primitive value type', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'String';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('String');
            });
            it('should return the aggregate type, given a Resource-type and an aggregate type', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'Map';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('Map');
            });
            it('should be able to form a parameterized aggregate type with a valid Property-type as argument, given a Resource-type and a parameterized aggregate type with a property name as argument', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'Map<somethingCool>';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('Map<AWS::S3::Bucket.somethingCool>');
            });
            it('should be able to form a parameterized aggregate type with a valid Property-type as argument, given a Resource-type and a parameterized aggregate type with a Property-type as argument', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'Map<AWS::CodeBuild::Project.Artifacts>';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('Map<AWS::S3::Bucket.Artifacts>');
            });
            it('should be able to form a sub-parameterized aggregate type, given a Resource-type and a sub-parameterized aggregate type with a property name as argument', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'Map<List<somethingCool>>';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('Map<List<AWS::S3::Bucket.somethingCool>>');
            });
            it('should be able to form a sub-parameterized aggregate type, given a Resource-type and a sub-parameterized aggregate type with a Property-type as argument', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'Map<List<AWS::CodeBuild::Project.Artifacts>>';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('Map<List<AWS::S3::Bucket.Artifacts>>');
            });
            it('should be able to form a valid Property-type, given a Resource-type and a property name', function () {
                var inputBaseType = 'AWS::CodeBuild::Project';
                var inputType = 'Artifacts';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('AWS::CodeBuild::Project.Artifacts');
            });
            it('should be able to form a valid Property-type, given a Resource-type and a Property-type', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('AWS::S3::Bucket.Artifacts');
            });
            it('should be able to form a valid Property-type, given a parameterized Resource-type and a Property-type', function () {
                var inputBaseType = 'AWS::S3::Bucket<somethingAwesome>';
                var inputType = 'AWS::CodeBuild::Project.Artifacts';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('AWS::S3::Bucket<somethingAwesome>.Artifacts');
            });
            it('should be able to form a valid Property-type, given a Resource-type and a Property-type that has a parameterized base name', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'AWS::CodeBuild::Project<somethingCool>.Artifacts';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('AWS::S3::Bucket.Artifacts');
            });
            it('should be able to form a valid Property-type, given a Resource-type and a Property-type that has a parameterized argument', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'AWS::CodeBuild::Project.Artifacts<somethingBeautiful>';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('AWS::S3::Bucket.Artifacts<AWS::S3::Bucket.somethingBeautiful>');
            });
            it('should be able to form a valid Property-type, given a Resource-type and a Property-type that has a sub-parameterized argument', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'AWS::CodeBuild::Project.Artifacts<somethingBeautiful<somethingCool>>';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('AWS::S3::Bucket.Artifacts<AWS::S3::Bucket.somethingBeautiful<AWS::S3::Bucket.somethingCool>>');
            });
            it('should be able to form a sub-parameterized aggregate type, given a Resource-type and a sub-parameterized aggregate type with an argument of Property-type that has a sub-parameterized argument', function () {
                var inputBaseType = 'AWS::S3::Bucket';
                var inputType = 'Map<List<AWS::CodeBuild::Project.Artifacts<somethingBeautiful<somethingCool>>>>';
                var result = resourceSpec.rebaseTypeFormat(inputBaseType, inputType);
                expect(result).to.equal('Map<List<AWS::S3::Bucket.Artifacts<AWS::S3::Bucket.somethingBeautiful<AWS::S3::Bucket.somethingCool>>>>');
            });
        });
    });
});
//# sourceMappingURL=resourcesTest.js.map