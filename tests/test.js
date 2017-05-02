'use strict';

var loopbackApiTesting = require('./testRunner');
var tests = require('./tests.json');
var server = require('../server/server.js');
var autoGen = require('./automaticTestObjectGenerator.js');
var url = 'http://localhost:4000/api';

function snakeToCamel(s) {
  return s.replace(/(-\w)/g, function(m) { return m[1].toUpperCase(); });
}

var apiTestingConfig = [];

for (var i = 0; i < tests.length; i++) {
  var testDesc = tests[i];
  var test = [];

  var obj1 = autoGen(
    require('../common/models/' + testDesc.title.toLowerCase() + '.json')
  );

  // GET
  test.push({
    'method': 'GET',
    'url': snakeToCamel(testDesc.title) + 's',
    'expect': 200,
    'expectObj': [],
  });

  // POST

  // GET

  // DELETE

  // GET

  apiTestingConfig.push({
    title: testDesc.title,
    test: test,
  });
}

loopbackApiTesting.run(apiTestingConfig, server, url, function(err) {
  if (err) {
    console.log(err);
  }
});
