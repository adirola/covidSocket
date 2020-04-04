'use strict';

const Circuit = require('circuit-sdk');
const config = require('./config.json');

let client;
let emitter;
let appointmentNr = 1000;

//Circuit.setLogger(console);
//Circuit.logger.setLevel(Circuit.Enums.LogLevel.Debug);

/**
 * Initialize
 * @param {Object} events Event emitter
 */
function init (events) {
    emitter = events;
    client = new Circuit.Client(config.user);
    client.logon()
    .then(setupListeners)
    .catch(console.error);
}

/**
 * Create a conversation between the patient and doctor
 * @param {Object} patient
 */
function createConversation(patient) {
    let convPromise = client.createGroupConversation([patient.info.doctor.userId, client.loggedOnUser.userId], `Appt. ${appointmentNr++}`);
    let detailsPromise = convPromise.then(conv => {
        return client.getConversationDetails(conv.convId);
    });
    return Promise.all([convPromise, detailsPromise])
    .then(([conversation, details]) => {
        return {
            convId: conversation.convId,
            callId: conversation.rtcSessionId,
            url: details.link
        }
    });
}

/**
 * Setup the listeners for call state events
 */
function setupListeners() {
    client.addEventListener('callStatus', evt => {
        let call = evt.call;
        if (evt.reason === 'callStateChanged' && call.state === 'Started') {
            emitter.emit('conf-started', call.callId);
        }
    });
    client.addEventListener('callEnded', evt => {
        emitter.emit('conf-ended', evt.call.callId);
    });
}

module.exports = {
    init,
    createConversation
}
