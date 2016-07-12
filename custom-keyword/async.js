'use strict';

var rp = require('request-promise');
var Ajv = require('ajv');
var ajv = new Ajv();

ajv.addKeyword('idExists', {
  async: true,
  type: 'number',
  validate: checkIdExists
});

function checkIdExists(schema, data) {
    var base = 'http://jsonplaceholder.typicode.com/';
    var table = schema.table;

    // Must return a promise
    return rp({
        uri: base + table + '/' + data,
        json: true
    })
    .then(function (res) {
        // If we get a response and it's id equals our id
        // then it is valid
        console.log('------------RESPONSE--------------');
        console.log(table, res);
        console.log('----------END RESPONSE------------');
        return data === res.id;
    })
    .catch(function (err) {
        // If it gets a > 400 status, or fails, then it's false
        return false;
    });
}

var schema = {
  "$async": true,
  "properties": {
    "userId": {
      "type": "integer",
      "idExists": { "table": "users" } // New keyword is reusable
    },
    "postId": {
      "type": "integer",
      "idExists": { "table": "posts" }
    }
  }
};


var validate = ajv.compile(schema);

validate({ userId: 1, postId: 100 })
.then(function (valid) {
    console.log('Data is valid');
})
.catch(function (err) {
    console.log('Validation errors:', err.errors);
});
