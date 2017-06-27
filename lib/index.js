const winston = require('winston');                                 // Async logging
const clearRequire = require('clear-require');                      // Clear requires

const mockery = require('mockery');                                 // Mock external network requests
const mock = require('mock-require');                               // Mock functionality fo a require
const sinon = require('sinon');                                     // Spy on method calls
const awsHelpers = require('../vendor/aws-sdk-js/test/helpers');    // Test AWS cli tool methods

// Setup mocks
mock('aws-sdk', awsHelpers.AWS);
awsHelpers.mockHttpResponse(200, {},'{ "foo": "bar" }');

// Setup winston
winston.level = 'error';

class LambdaHelper {
    /**
     * Create a new LambdaHelper object.
     *
     * @example
     * const lambdaHelper = new LambdaHelper('../index.js');
     *
     * @example
     * const lambdaHelper = new LambdaHelper('../index.js', 'us-east-1');
     *
     * @param {String} lambdaFile The main handler for your Lambda.
     * @param {String} [region='eu-west-1'] The region you would like to pretend to run our Lambda in.
     */
    constructor(lambdaFile, region='eu-west-1') {
        this.lambdaFile = lambdaFile;
        this.region = region;
        this.done = null;
        this.error = null;
    }

    /**
     * Execute your Lambda with a passed event.
     *
     * @example
     * const lambdaHelper = new LambdaHelper('../index.js');
     *
     * describe('my lambda', function(){
     *   beforeEach(function(cb){
     *     let event = { foo: 'bar' };
     *     lambdaHelper.execute(event, cb);
     *   });
     *
     *   it('succeeded', function(){
     *     expect(lambdaHelper.success?).to eql(true);
     *   });
     *
     *   it('has the expected message', function() {
     *     expect(lambdaHelper.done.message).to eql('Hello World');
     *   }
     * });
     *
     * @param {Object} event
     * @param {Function} callback
     * @param {Boolean} [debug=false] Should we include additional logging?
     */
    execute(event, callback, debug=false) {
        const lambdalocal = require('lambda-local');
        const lambda = require(this.lambdaFile);

        lambdalocal.setLogger(winston);

        let self = this;
        self.error = null;
        self.done = null;

        let cb = callback;

        lambdalocal.execute({
            event: event,
            lambdaFunc: lambda,
            region: this.region,
            callbackWaitsForEmptyEventLoop: false,
            timeoutMs: 3000,
            environment: {
                DEBUG: true
            },
            callback: function (_error, _done) {
                self.error = _error;
                self.done = _done;

                if (self.error && debug) {
                    console.log('context.err');
                    console.log(self.error);
                }

                if (self.done && debug) {
                    console.log('context.done');
                    console.log(self.done);
                }

                clearRequire(self.lambdaFile);
                cb();
            }
        });
    }
}

module.exports = LambdaHelper;
