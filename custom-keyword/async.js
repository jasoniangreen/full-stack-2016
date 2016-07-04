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
    return rp({
        uri: base + table + '/' + data,
        json: true
    })
    .then(function (res) {
        console.log('--------------------------');
        console.log(table, res);
        return data === res.id;
    })
    .catch(function (err) {
        return false;
    });
}

var schema = {
  "$async": true,
  "properties": {
    "userId": {
      "type": "integer",
      "idExists": { "table": "users" }
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
