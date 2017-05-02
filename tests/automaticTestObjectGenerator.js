'use strict';

var Chance = require('chance');
var chance = new Chance();

function generateObject(model) {
  var props = model.properties;

  var obj = {};

  for (var prop in props) {
    if (props.hasOwnProperty(prop)) {
//      console.log(props[prop].type);
      switch (props[prop].type) {
        case 'string':
          obj[prop] = chance.string();
          break;
        case 'number':
          obj[prop] = chance.integer();
          break;
        case 'boolean':
          obj[prop] = chance.bool();
          break;
        case 'date':
          obj[prop] = chance.date();
          break;
        default:
          break;
      }
    }
  }

  return obj;
}

module.exports = generateObject;

