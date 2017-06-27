'use strict';

const mocha =  require('mocha');
const chai =   require('chai');
const expect = chai.expect;

const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.use(sinonChai);

const LambdaHelper = require('../../lib/index');

describe('LambdaHelper', function () {
    describe('#constructor', function () {
        let lambdaHelper;

        context('without a region', function () {
            beforeEach(function(){
                lambdaHelper = new LambdaHelper('../../examples/alexa-sdk/index.js');
            });

            it('stores the lambdaFile', function () {
                expect(lambdaHelper.lambdaFile).to.eql('../../examples/alexa-sdk/index.js');
            });

            it('stores the default region', function () {
                expect(lambdaHelper.region).to.eql('eu-west-1');
            })
        });

        context('with a region', function () {
            beforeEach(function () {
                lambdaHelper = new LambdaHelper('../../examples/alexa-sdk/index.js', 'us-east-1');
            });

            it('stores the lambdaFile', function () {
                expect(lambdaHelper.lambdaFile).to.eql('../../examples/alexa-sdk/index.js');
            });

            it('stores the default region', function () {
                expect(lambdaHelper.region).to.eql('us-east-1');
            })
        })
    });

    describe('#execute', function () {
        let lambdaHelper;

        beforeEach(function () {
            lambdaHelper = new LambdaHelper('../examples/alexa-sdk/index.js');
        });

        context('with a valid event', function () {
            beforeEach(function(cb){
                let event = require('../fixtures/examples/alexa-sdk/requests/LaunchRequest.json');

                lambdaHelper.execute(event, cb);
            });

            it('populates done and not error', function () {
                expect(lambdaHelper.done).to.be.an('object');
                expect(lambdaHelper.error).to.be.an('null');
            });

            it('generates a response as expected', function () {
                let response = require('../fixtures/examples/alexa-sdk/responses/LaunchRequest.json');

                if(lambdaHelper.done.sessionAttributes.guessNumber) {
                    response.sessionAttributes.guessNumber = lambdaHelper.done.sessionAttributes.guessNumber;
                }

                expect(lambdaHelper.done).to.deep.eql(response);
            });
        });

        context('with an invalid event', function () {
            beforeEach(function(cb){
                let event = { session: { application: { applicationId: '1234' }, user: { userId: 'user123' } }, request: { locale: 'en-GB' } };

                lambdaHelper.execute(event, cb);
            });

            it('populates error and not done', function () {
                expect(lambdaHelper.done).to.be.an('undefined');
                expect(lambdaHelper.error.message).to.include("Cannot read property 'substring' of undefined");
            });
        });

        describe('debug', function(){
            beforeEach(function() {
                sinon.spy(console, 'log');
            });

            afterEach(function() {
                console.log.restore();
            });

            context('with a valid event', function () {
                beforeEach(function(cb){
                    let event = require('../fixtures/examples/alexa-sdk/requests/LaunchRequest.json');

                    lambdaHelper.execute(event, cb, true);
                });

                it('calls console.log as expected', function () {
                    expect(console.log).to.have.been.calledWith('context.done');
                    expect(console.log).not.to.have.been.calledWith('context.err');
                });
            });

            context('with an invalid function', function () {
                beforeEach(function(cb){
                    let event = { session: { application: { applicationId: '1234' }, user: { userId: 'user123' } }, request: { locale: 'en-GB' } };

                    lambdaHelper.execute(event, cb, true);
                });

                it('calls console.log as expected', function () {
                    expect(console.log).not.to.have.been.calledWith('context.done');
                    expect(console.log).to.have.been.calledWith('context.err');
                });
            })
        })
    });
});