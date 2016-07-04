'use strict';

var Ajv = require('ajv');
var ajv = new Ajv();

ajv.addKeyword('range', { type: 'number', compile: compileRange });
ajv.addKeyword('exclusiveRange'); // this is needed to reserve the keyword
 
function compileRange(schema, parentSchema) {
    var min = schema[0];
    var max = schema[1];
 
    return parentSchema.exclusiveRange === true
        ? function (data) { return data > min && data < max; }
        : function (data) { return data >= min && data <= max; }
}


var schema = {
    range: [5, 10],
    exclusiveRange: true
};

var validate = ajv.compile(schema);
 
console.log(validate(5)); // false
console.log(validate(5.1)); // true
console.log(validate(9.9)); // true
console.log(validate(10)); // false
