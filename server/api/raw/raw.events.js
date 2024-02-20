/**
 * Raw model events
 */

'use strict';

import {EventEmitter} from 'events';
var Raw = require('../../sqldb').Raw;
var RawEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RawEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Raw.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    RawEvents.emit(event + ':' + doc._id, doc);
    RawEvents.emit(event, doc);
    done(null);
  }
}

export default RawEvents;
