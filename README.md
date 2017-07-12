# [![Kappa-Lambda][logo]][kappa-lambda]
[Kappa-Lambda][kappa-lambda] is a [Node.js][node] package that provides classes and tools to help you test a lambda application locally.

[![NPM Version][shield-npm]][info-npm]
[![Supported Node Versions][shield-node]][node]
[![Build Status][shield-travis]][info-travis]
[![Bithound Score][shield-bithound]][info-bithound]
[![License][shield-license]][info-license]


### Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Getting Started
### Requirements
[Kappa-Lambda][kappa-lambda] requires the following:
* [Node.js][node] - [click here][node-version] for the exact version
* [npm][npm]

### Installation
```bash
npm install --save-dev kappa-lambda
```

### Usage
[Kappa-Lambda][kappa-lambda] is designed to be used with popular frameworks such as Mocha, Chai and Jasmine.

At the top of your test file, create a new KappaLambda and create a variable pointing to your Lambda Function.

The following code is all taken from `test/examples/alexa-sdk/index.spec.js`.

```javascript
const KappaLambda = require('kappa-lambda');
const lambdaFile = '../examples/alexa-sdk/index.js';
const kappaLambda = new KappaLambda(lambdaFile);
```

Adding [Kappa-Lambda][kappa-lambda] into a beforeEach function means you can check the return of your lambda easily.

```javascript
describe('Alexa SDK Example', function(){
    context('No State', function(){
        describe('NewSession', function(){
            beforeEach(function(cb){
                let event = require('../../fixtures/examples/alexa-sdk/requests/LaunchRequest.json');

                kappaLambda.execute(event, cb);
            });

            it('responds with the correct output text', function(){
                expect(kappaLambda.done.response.outputSpeech.ssml)
                    .to.eql('<speak> Welcome to High Low guessing game. You have played 0 times. Would you like to play? </speak>');
            });
        });
    });
});
```

You can check that a certain error was raised like so:

```javascript
it('populates error and not done', function () {
    expect(kappaLambda.done).to.be.an('undefined');
    expect(kappaLambda.error.message).to.include("Cannot read property 'substring' of undefined");
});
```

### Examples
Project type | Source | Tests
---|---|---
[Alexa SDK][alexa-sdk] | [Source][alexa-sdk-source] | [Tests][alexa-sdk-tests]

## Contributing
If you wish to submit a bug fix or feature, you can create a pull request and it will be merged pending a code review.

1. Clone it
1. Create your feature branch (git checkout -b my-new-feature)
1. Commit your changes (git commit -am 'Add some feature')
1. Push to the branch (git push origin my-new-feature)
1. Create a new Pull Request


## License
[Kappa-Lambda][kappa-lambda] is licensed under the [MIT License][info-license].

[logo]: https://cdn.rawgit.com/mattrayner/kappa-lambda/73cfd0e9cc912a8a72165d5e345f80bc3a1f631f/logo2.svg

[kappa-lambda]: https://github.com/mattrayner/kappa-lambda
[node]: http://nodejs.org
[node-version]: https://github.com/mattrayner/kappa-lambda/blob/master/.nvmrc
[npm]: https://www.npmjs.com
[alexa-sdk]: https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs
[alexa-sdk-source]: https://github.com/mattrayner/kappa-lambda/blob/master/examples/alexa-sdk/index.js
[alexa-sdk-tests]: https://github.com/mattrayner/kappa-lambda/blob/master/test/examples/alexa-sdk/index.spec.js

[info-npm]: https://www.npmjs.com/package/kappa-lambda
[info-travis]: https://travis-ci.org/mattrayner/kappa-lambda
[info-license]: LICENSE
[info-bithound]: https://www.bithound.io/github/mattrayner/kappa-lambda
[shield-npm]: https://img.shields.io/npm/v/kappa-lambda.svg
[shield-travis]: https://img.shields.io/travis/mattrayner/kappa-lambda.svg
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
[shield-bithound]: https://www.bithound.io/github/mattrayner/kappa-lambda/badges/score.svg
[shield-node]: https://img.shields.io/badge/node%20support-6.10.*-blue.svg
