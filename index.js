/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        initData();
        const questionText = getQuestion();
        currentStatus = 'Question';
        const speakOutput = 'Hola! Vamos a jugar a ... ¡Practica Mates!... Tendrás que responder \
        diciendo la respuesta correcta a una operación matemática que se te propondrá. ... Vamos a empezar! ...\
        ' + questionText;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    handle(handlerInput) {
        const AnswerValue = handlerInput.requestEnvelope.request.intent.slots.numberSlot.value;
        let speakOutput = '';
        if (currentStatus === 'Continue') {
            speakOutput += 'Responde sí o no';
        }
        else {
            if (AnswerValue === currentIndex.result) {
                speakOutput += 'Respuesta correcta! ... ' + currentIndex.answer + '.';
                hits++;
            }
            else  {
                speakOutput += 'Respuesta incorrecta, la respuesta correcta es ' +  currentIndex.result+ ' porque ' + currentIndex.answer + '.';
            }
        }
        currentIndex = null;
        speakOutput += ' ... Continuamos? ';
        currentStatus = 'Continue';
        
        if (exit) {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        } 
        else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (currentStatus === 'Question') {
            speakOutput += 'Repetimos! ... ' + getQuestion(false);
        }
        else if (currentStatus === 'Continue') {
            speakOutput += 'Continuamos? ';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const speakOutput = getQuestion();
        currentStatus = 'Question';


        if (exit) {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        } 
        else {
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const PendingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PendingIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (pending === null) {
            if (currentIndex !== null && currentStatus === 'Question') {
                speakOutput += 'Hemos dejado esta pregunta sin responder, la guardamos para después ... '; 
                pending = currentIndex;
            }
            speakOutput += 'No tienes preguntas pendientes! ... Quieres continuar con una nueva pregunta?';
            currentStatus = 'Continue';
        }
        else {
            if (currentIndex !== null && currentStatus === 'Question') {
                let tmpIndex = currentIndex;
                currentIndex = pending;
                pending = currentIndex;
                speakOutput += 'Hemos dejado esta pregunta sin responder, la guardamos para después ... '; 
            }
            else {
                currentIndex = pending;
                pending = null;
            }
            
            speakOutput += 'Vamos con la pregunta que teníamos pendiente! ... ' + getQuestion(false);
            currentStatus = 'Question';
        }


        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const NextIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (pending !== null) {
            speakOutput = 'Alcanzaste el máximo de preguntas pendientes de responder, vamos a por ella de nuevo. ... ';
            const tmpIndex = currentIndex;
            currentIndex = pending;
            pending = tmpIndex;
            speakOutput += getQuestion(false);
        }
        else {
            speakOutput = 'Guardamos esta pregunta para después, vamos con la siguiente! ... ';
            pending = currentIndex;
            speakOutput += getQuestion();
        }
        currentStatus = 'Question';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ClueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClueIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        if (currentStatus === 'Question') {
            speakOutput += 'Ahí va una pista! ... ' + currentIndex.clue + '. ... Te vuelvo a repetir la opreación. ... ' + getQuestion(false);
        }
        else if (currentStatus === 'Continue') {
            speakOutput += 'Responde Sí o No.';
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'El juego consiste en que te iré haciendo preguntas y tendrás que contestar correctamente \
        , pero si no sabes la respuesta puedes decirme que pase a la \
        siguiente y así tendrás tiempo de pensar la respuesta. Puedes tener hasta una pregunta pendiente de responder.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Has conseguido acertar ' + hits + ' de ' + count + ' preguntas. ... Hasta luego!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, no entiendo lo que me dices. Por favor inténtalo otra vez.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, tuve problemas para hacer lo que me pediste. Inténtalo de nuevo.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

let questionsList, currentIndex, count, hits, pending, currentStatus, exit;
function initData() {
    //questionsList = require('./question-list');
    questionsList = {
        '0' : {
            'id' : '0',
            'question' : 'Esta operación es muy sencilla... ¿Cuanto es (3 x 4) + 1 ?',
            'result' : '13',
            'answer' : 'La respuesta correcta ante esta operación es 13.',
            'clue' : 'Recuerda que primero debes llevar a cabo la operación que hay dentro de los parentesis, y más tarde realizar la suma'
        },
        '1' : {
            'id' : '1',
            'question' : 'Veamos.. ¿Cuanto es (2 x 12) + (7 + 12)?',
            'result' : '43',
            'answer' : 'La respuesta correcta es 43.',
            'clue' : 'Recuerda llevar a cabo las operaciones de dentro de los parentesis, más tarde realiza la suma'
        },
        '2' : {
            'id' : '2',
            'question' : 'Veamos.. ¿Cuanto es (9 / 3) - 2?',
            'result' : '1',
            'answer' : 'La respuesta correcta en este caso es 1.',
            'clue' : 'Recuerda que primero debes realizar la operación de división para posteriormente hacer la suma'

        },
        '3' : {
            'id' : '3',
            'question' : 'Veamos.. ¿Cuanto es (60 / 2) - 12?',
            'result' : '18',
            'answer' : 'La respuesta correcta en este caso es 18.',
            'clue' : 'Para obtener el resultado correcto, realiza primero la división'
        }
    };
    currentIndex = null;
    count = 0;
    hits = 0;
    pending = null;
    currentStatus = null;
    exit = false;
}


function getRandomItem(obj) {
    if (Object.keys(obj).length === 0) {
        return null;
    }
    currentIndex =  obj[Object.keys(obj)[Math.floor(Math.random()*Object.keys(obj).length)]];
    return currentIndex;
}

function getQuestion(random = true) {
    let speechText = '';
    if (random) {
        speechText = getRandomItem(questionsList);
        if (currentIndex === null && pending === null) {
            const speakOutput = 'Ya respondiste todas las preguntas! ... Has conseguido acertar ' + hits + ' de ' + count + ' preguntas. ... Hasta luego!';
            exit = true;
            return speakOutput;
        }
        else if (currentIndex === null) {
            return 'Ya no te quedan más preguntas nuevas, pero sí te queda una pendiente, vamos con ella. ... ' + '¿En qué año ' + speechText.question + '? ';
        }
        delete questionsList[currentIndex.id];
        count++;
    }
    else {
        speechText = currentIndex;
    }
    const speakOutput = '¿En qué año ' + speechText.question + '? ';
    return speakOutput
}

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AnswerIntentHandler,
        RepeatIntentHandler,
        NextIntentHandler,
        ClueIntentHandler,
        HelpIntentHandler,
        YesIntentHandler,
        PendingIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();