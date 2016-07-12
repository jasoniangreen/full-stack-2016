'use strict';

var Ajv = require('ajv');
var ajv = new Ajv();

// Rather than just having a validation function, we want to return one that
// uses the options we pass in the schema
ajv.addKeyword('range', { type: 'number', compile: compileRange });
ajv.addKeyword('exclusiveRange'); // this is needed to reserve the keyword
 
function compileRange(schema, parentSchema) {
    var min = schema[0]; // getting out schema options
    var max = schema[1];
 
    // returning a function that gets data as an arg
    // (data, path, parent, index)
    return parentSchema.exclusiveRange === true
        ? function (data) { return data > min && data < max; } 
        : function (data) { return data >= min && data <= max; }
}


var schema = {
    range: [5, 10],
    exclusiveRange: true
};

var validate = ajv.compile(schema);
 
console.log('5  ', validate(5)); // false
console.log('5.1', validate(5.1)); // true
console.log('9.9', validate(9.9)); // true
console.log('10 ', validate(10)); // false
console.log('wef', validate('wef')); // true
