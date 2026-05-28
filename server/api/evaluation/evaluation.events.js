/**
 * Evaluation model events
 */

'use strict';

import {EventEmitter} from 'events';
var Evaluation = require('../../sqldb').Evaluation;
var EvaluationEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
EvaluationEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Evaluation.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    EvaluationEvents.emit(event + ':' + doc._id, doc);
    EvaluationEvents.emit(event, doc);
    done(null);
  }
}

export default EvaluationEvents;
