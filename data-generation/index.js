'use strict';

var jsf = require('json-schema-faker');
var userSchema = require('./user-schema-1.json');
// var userSchema = require('./user-schema-2.json');
// var userSchema = require('./user-schema-3.json');

var sample = jsf(userSchema);

console.log(JSON.stringify(sample));
