/**
 * Created by following the documentation here:
 * https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/3c91133e99ab404d7aeb6765cb01ecb2100494da/Readme.md
 */
var Alexa = require('alexa-sdk');

var logIntent = function(name){
    console.log("Intent: " + name);
};

var states = {
    GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
    STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
};

var newSessionHandlers = {

    // This will short-cut any incoming intent or launch requests and route them to this handler.
    'NewSession': function() {
        logIntent(this.name);

        if(Object.keys(this.attributes).length === 0) { // Check if it's the first time the skill has been invoked
            this.attributes['endedSessionCount'] = 0;
            this.attributes['gamesPlayed'] = 0;
        }
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'Welcome to High Low guessing game. You have played '
            + this.attributes['gamesPlayed'].toString() + ' times. Would you like to play?',
            'Say yes to start the game or no to quit.');
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {

    'NewSession': function () {
        logIntent(this.name);

        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },

    'AMAZON.HelpIntent': function() {
        logIntent(this.name);

        var message = 'I will think of a number between zero and one hundred, try to guess and I will tell you if it' +
            ' is higher or lower. Do you want to start the game?';
        this.emit(':ask', message, message);
    },

    'AMAZON.YesIntent': function() {
        logIntent(this.name);

        this.attributes['guessNumber'] = Math.floor(Math.random() * 100);
        this.handler.state = states.GUESSMODE;
        this.emit(':ask', 'Great! ' + 'Try saying a number to start the game.', 'Try saying a number.');
    },

    'AMAZON.NoIntent': function() {
        logIntent(this.name);

        this.emit(':tell', 'Ok, see you next time!');
    },

    'SessionEndedRequest': function () {
        logIntent(this.name);

        console.log('session ended! (_STARTMODE)');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':saveState', true);
    },

    'Unhandled': function() {
        logIntent(this.name);

        var message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
});

var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {

    'NewSession': function () {
        logIntent(this.name);

        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },

    'NumberGuessIntent': function() {
        logIntent(this.name);

        var guessNum = parseInt(this.event.request.intent.slots.number.value);
        var targetNum = this.attributes['guessNumber'];

        console.log('user guessed: ' + guessNum);

        if(guessNum > targetNum){
            this.emit(':ask', 'Sorry, ' + guessNum.toString() + ' is too high. Say another number to try again, or say ' +
                'cancel to quit.', 'Try saying a number, or, cancel, to quit.');
        } else if( guessNum < targetNum){
            this.emit(':ask', 'Sorry, ' + guessNum.toString() + ' is too low. Say another number to try again, or say ' +
                'cancel to quit.', 'Try saying a number, or, cancel, to quit.');
        } else if (guessNum === targetNum){
            this.handler.state = states.STARTMODE;

            this.emit(':ask', guessNum.toString() + ' is correct! Would you like to play a new game?',
                'Say yes to start a new game, or no to end the game.');
        } else {
            this.emit(':ask', 'Try saying a number', 'Try saying a number, or, cancel, to quit.');
        }
    },

    'AMAZON.HelpIntent': function() {
        logIntent(this.name);

        this.emit(':ask', 'I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
            ' if it is higher or lower.', 'Try saying a number.');
    },

    'SessionEndedRequest': function () {
        logIntent(this.name);

        console.log('session ended! (_GUESSMODE)');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
    },

    'Unhandled': function() {
        logIntent(this.name);

        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
    }

});

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = '1234';
    alexa.dynamoDBTableName = 'YourTableName';
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers);
    alexa.execute();
};
