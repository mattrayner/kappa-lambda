'use strict';

const mocha = require('mocha');
const chai =   require('chai');
const expect = chai.expect;

const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.use(sinonChai);

const LambdaHelper = require('../../../lib/index');
const lambdaFile = '../examples/alexa-sdk/index.js';
const lambdaHelper = new LambdaHelper(lambdaFile);

describe('Alexa SDK Example', function(){
    context('No State', function(){
        describe('NewSession', function(){
            beforeEach(function(cb){
                let event = require('../../fixtures/examples/alexa-sdk/requests/LaunchRequest.json');

                lambdaHelper.execute(event, cb);
            });

            it('responds with the correct output text', function(){
                expect(lambdaHelper.done.response.outputSpeech.ssml)
                    .to.eql('<speak> Welcome to High Low guessing game. You have played 0 times. Would you like to play? </speak>');
            });

            it('responds with the correct reprompt text', function(){
                expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                    .to.eql('<speak> Say yes to start the game or no to quit. </speak>');
            });

            describe('responding with an AMAZON.HelpIntent', function () {
                beforeEach(function (cb) {
                    let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.HelpIntent.json');
                    // Populate the session attribute from the last request in order to continue.
                    event.session.attributes = lambdaHelper.done.sessionAttributes;

                    lambdaHelper.execute(event, cb);
                });

                it('responds with the correct output text', function () {
                    expect(lambdaHelper.done.response.outputSpeech.ssml)
                        .to.eql('<speak> I will think of a number between zero and one hundred, try to guess and I will tell you if it is higher or lower. Do you want to start the game? </speak>')
                });

                it('responds with the correct reprompt text', function () {
                    expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                        .to.eql('<speak> I will think of a number between zero and one hundred, try to guess and I will tell you if it is higher or lower. Do you want to start the game? </speak>')
                });

                it('responds with the correct state', function () {
                    expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_STARTMODE');
                });
            });

            describe('responding with an AMAZON.YesIntent', function(){
                beforeEach(function(cb){
                    let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.YesIntent.json');
                    // Populate the session attribute from the last request in order to continue.
                    event.session.attributes = lambdaHelper.done.sessionAttributes;

                    lambdaHelper.execute(event, cb);
                });

                it('responds with the correct output text', function(){
                    expect(lambdaHelper.done.response.outputSpeech.ssml)
                        .to.eql('<speak> Great! Try saying a number to start the game. </speak>')
                });

                it('responds with the correct reprompt text', function() {
                    expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                        .to.eql('<speak> Try saying a number. </speak>')
                });

                it('responds with the correct state', function(){
                    expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_GUESSMODE');
                });

                // Respond with Help
                describe('responding with an AMAZON.YesIntent', function() {
                    beforeEach(function (cb) {
                        let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.HelpIntent.json');
                        // Populate the session attribute from the last request in order to continue.
                        event.session.attributes = lambdaHelper.done.sessionAttributes;

                        lambdaHelper.execute(event, cb);
                    });

                    it('responds with the correct output text', function () {
                        expect(lambdaHelper.done.response.outputSpeech.ssml)
                            .to.eql('<speak> I am thinking of a number between zero and one hundred, try to guess and I will tell you if it is higher or lower. </speak>')
                    });

                    it('responds with the correct reprompt text', function () {
                        expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                            .to.eql('<speak> Try saying a number. </speak>')
                    });

                    it('responds with the correct state', function () {
                        expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_GUESSMODE');
                    });
                });

                // Respond with a dodgy intent
                describe('responding with an unexpected intent \'Foo\'', function() {
                    beforeEach(function (cb) {
                        let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.HelpIntent.json');
                        // Populate the session attribute from the last request in order to continue.
                        event.session.attributes = lambdaHelper.done.sessionAttributes;
                        event.request.intent.name = 'Foo';

                        lambdaHelper.execute(event, cb);
                    });

                    it('responds with the correct output text', function () {
                        expect(lambdaHelper.done.response.outputSpeech.ssml)
                            .to.eql('<speak> Sorry, I didn\'t get that. Try saying a number. </speak>')
                    });

                    it('responds with the correct reprompt text', function () {
                        expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                            .to.eql('<speak> Try saying a number. </speak>')
                    });

                    it('responds with the correct state', function () {
                        expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_GUESSMODE');
                    });
                });

                // Respond with a SessionEndedRequest
                describe('responding with a SessionEndedRequest', function () {
                    beforeEach(function () {
                        sinon.spy(console, 'log');

                        let event = require('../../fixtures/examples/alexa-sdk/requests/SessionEndedRequest.json');
                        // Populate the session attribute from the last request in order to continue.
                        event.session.attributes = lambdaHelper.done.sessionAttributes;

                        lambdaHelper.execute(event, null, true);
                    });

                    afterEach(function() {
                        console.log.restore();
                    });

                    it('outputs the session ended log', function () {
                        expect(console.log).to.have.been.calledWith('session ended! (_GUESSMODE)');
                    });
                });

                // Respond with a number
                describe('responding with a NumberGuessIntent', function() {
                    // Correct
                    context('with a correct number', function(){
                        beforeEach(function (cb) {
                            let event = require('../../fixtures/examples/alexa-sdk/requests/NumberGuessIntent.json');
                            // Populate the session attribute from the last request in order to continue.
                            event.session.attributes = lambdaHelper.done.sessionAttributes;
                            event.request.intent.slots.number.value = lambdaHelper.done.sessionAttributes.guessNumber;

                            lambdaHelper.execute(event, cb);
                        });

                        it('responds with the correct output text', function () {
                            expect(lambdaHelper.done.response.outputSpeech.ssml)
                                .to.eql('<speak> '+ lambdaHelper.done.sessionAttributes.guessNumber + ' is correct! Would you like to play a new game? </speak>')
                        });

                        it('responds with the correct reprompt text', function () {
                            expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                                .to.eql('<speak> Say yes to start a new game, or no to end the game. </speak>')
                        });

                        it('responds with the correct state', function () {
                            expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_STARTMODE');
                        });

                        describe('responding with an AMAZON.YesIntent', function () {
                            beforeEach(function(cb){
                                let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.YesIntent.json');
                                // Populate the session attribute from the last request in order to continue.
                                event.session.attributes = lambdaHelper.done.sessionAttributes;

                                lambdaHelper.execute(event, cb);
                            });

                            it('responds with the correct output text', function(){
                                expect(lambdaHelper.done.response.outputSpeech.ssml)
                                    .to.eql('<speak> Great! Try saying a number to start the game. </speak>')
                            });

                            it('responds with the correct reprompt text', function() {
                                expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                                    .to.eql('<speak> Try saying a number. </speak>')
                            });

                            it('responds with the correct state', function(){
                                expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_GUESSMODE');
                            });
                        });

                        describe('responding with an AMAZON.NoIntent', function () {
                            beforeEach(function(cb){
                                let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.NoIntent.json');
                                // Populate the session attribute from the last request in order to continue.
                                event.session.attributes = lambdaHelper.done.sessionAttributes;

                                lambdaHelper.execute(event, cb);
                            });

                            it('responds with the correct output text', function(){
                                expect(lambdaHelper.done.response.outputSpeech.ssml)
                                    .to.eql('<speak> Ok, see you next time! </speak>')
                            });

                            it('responds with the correct state', function(){
                                expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_STARTMODE');
                            });
                        })
                    });

                    // Incorrect
                    context('with an incorrect number', function () {
                        context('with the number too low', function () {
                            beforeEach(function (cb) {
                                let event = require('../../fixtures/examples/alexa-sdk/requests/NumberGuessIntent.json');
                                // Populate the session attribute from the last request in order to continue.
                                event.session.attributes = lambdaHelper.done.sessionAttributes;
                                event.request.intent.slots.number.value = parseInt(lambdaHelper.done.sessionAttributes.guessNumber) - 1;

                                lambdaHelper.execute(event, cb);
                            });

                            it('responds with the correct output text', function () {
                                expect(lambdaHelper.done.response.outputSpeech.ssml)
                                    .to.eql('<speak> Sorry, ' + (parseInt(lambdaHelper.done.sessionAttributes.guessNumber) - 1) + ' is too low. Say another number to try again, or say cancel to quit. </speak>')
                            });

                            it('responds with the correct reprompt text', function () {
                                expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                                    .to.eql('<speak> Try saying a number, or, cancel, to quit. </speak>')
                            });

                            it('responds with the correct state', function () {
                                expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_GUESSMODE');
                            });
                        });

                        context('with the number too high', function () {
                            beforeEach(function (cb) {
                                let event = require('../../fixtures/examples/alexa-sdk/requests/NumberGuessIntent.json');
                                // Populate the session attribute from the last request in order to continue.
                                event.session.attributes = lambdaHelper.done.sessionAttributes;
                                event.request.intent.slots.number.value = parseInt(lambdaHelper.done.sessionAttributes.guessNumber) + 1;

                                lambdaHelper.execute(event, cb);
                            });

                            it('responds with the correct output text', function () {
                                expect(lambdaHelper.done.response.outputSpeech.ssml)
                                    .to.eql('<speak> Sorry, '+ (parseInt(lambdaHelper.done.sessionAttributes.guessNumber) + 1) + ' is too high. Say another number to try again, or say cancel to quit. </speak>')
                            });

                            it('responds with the correct reprompt text', function () {
                                expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                                    .to.eql('<speak> Try saying a number, or, cancel, to quit. </speak>')
                            });

                            it('responds with the correct state', function () {
                                expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_GUESSMODE');
                            });
                        })
                    });

                    // Not a number
                    context('with a non-number value', function () {
                        beforeEach(function (cb) {
                            let event = require('../../fixtures/examples/alexa-sdk/requests/NumberGuessIntent.json');
                            // Populate the session attribute from the last request in order to continue.
                            event.session.attributes = lambdaHelper.done.sessionAttributes;
                            event.request.intent.slots.number.value = 'Foo';

                            lambdaHelper.execute(event, cb);
                        });

                        it('responds with the correct output text', function () {
                            expect(lambdaHelper.done.response.outputSpeech.ssml)
                                .to.eql('<speak> Try saying a number </speak>')
                        });

                        it('responds with the correct reprompt text', function () {
                            expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                                .to.eql('<speak> Try saying a number, or, cancel, to quit. </speak>')
                        });

                        it('responds with the correct state', function () {
                            expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_GUESSMODE');
                        });
                    });

                });
            });

            describe('responding with an AMAZON.NoIntent', function () {
                beforeEach(function(cb){
                    let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.NoIntent.json');
                    // Populate the session attribute from the last request in order to continue.
                    event.session.attributes = lambdaHelper.done.sessionAttributes;

                    lambdaHelper.execute(event, cb);
                });

                it('responds with the correct output text', function(){
                    expect(lambdaHelper.done.response.outputSpeech.ssml)
                        .to.eql('<speak> Ok, see you next time! </speak>')
                });

                it('responds with the correct state', function(){
                    expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_STARTMODE');
                });

                it('responds with the correct gamesPlayed value', function(){
                    expect(lambdaHelper.done.sessionAttributes.gamesPlayed).to.eql(0);
                })
            });

            describe('responding with a dodgy intent \'Foo\' and debug execution', function () {
                beforeEach(function (cb) {
                    let event = require('../../fixtures/examples/alexa-sdk/requests/AMAZON.HelpIntent.json');
                    // Populate the session attribute from the last request in order to continue.
                    event.session.attributes = lambdaHelper.done.sessionAttributes;
                    event.request.intent.name = 'Foo';

                    lambdaHelper.execute(event, cb, true);
                });

                it('responds with the correct output text', function () {
                    expect(lambdaHelper.done.response.outputSpeech.ssml)
                        .to.eql('<speak> Say yes to continue, or no to end the game. </speak>')
                });

                it('responds with the correct reprompt text', function () {
                    expect(lambdaHelper.done.response.reprompt.outputSpeech.ssml)
                        .to.eql('<speak> Say yes to continue, or no to end the game. </speak>')
                });

                it('responds with the correct state', function () {
                    expect(lambdaHelper.done.sessionAttributes.STATE).to.eql('_STARTMODE');
                });
            });

            describe('responding with a SessionEndedRequest', function () {
                beforeEach(function () {
                    sinon.spy(console, 'log');

                    let event = require('../../fixtures/examples/alexa-sdk/requests/SessionEndedRequest.json');
                    // Populate the session attribute from the last request in order to continue.
                    event.session.attributes = lambdaHelper.done.sessionAttributes;

                    lambdaHelper.execute(event, null, true);
                });

                afterEach(function() {
                    console.log.restore();
                });

                it('outputs the session ended log', function () {
                    expect(console.log).to.have.been.calledWith('session ended! (_STARTMODE)');
                });
            });
        })
    });
});