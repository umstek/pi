/* eslint-disable max-len */
'use strict';

var supertest = require('supertest');
var async = require('async');

module.exports = {
  run: function(conf, app, url, callback) {
    var server;
    var agent = supertest.agent(url);
    var baseURL = '/';

    if (typeof conf !== 'object') {
      return callback('Failed to load test configuration from file');
    }

    if (app) {
      before(function(done) {
        server = app.listen(done);
      });

      after(function(done) {
        server.close(done);
      });
    }

    for (var i = 0; i < conf.length; i++) {
      var title = conf[i].title;
      var test = conf[i].test;

      describe(title, function() {
        async.each(test, function(c, asyncCallback) {
          if (!c.hasOwnProperty('method')) {
            callback('Test has no method specified');
            return asyncCallback();
          }

          if (!c.hasOwnProperty('url')) {
            callback('Test has no route specified');
            return asyncCallback();
          }

          if (!c.hasOwnProperty('expect')) {
            callback('Test has no expected response code specified');
            return asyncCallback();
          }

          var hasData = (c.hasOwnProperty('withData'));
          var isWithAuthentication = (c.hasOwnProperty('username') && c.hasOwnProperty('password'));
          var authenticationDescription = (isWithAuthentication) ? 'authenticated' : 'unauthenticated';

          var description = 'should respond ' + c.expect + ' on ' + authenticationDescription + ' ' + c.method + ' requests to /' + c.url;
          var parsedMethod, loginBlock;

          if (c.method.toUpperCase() === 'GET') {
            parsedMethod = agent.get(baseURL + c.url);
          } else if (c.method.toUpperCase() === 'POST') {
            parsedMethod = agent.post(baseURL + c.url);
          } else if (c.method.toUpperCase() === 'PUT') {
            parsedMethod = agent.put(baseURL + c.url);
          } else if (c.method.toUpperCase() === 'DELETE') {
            parsedMethod = agent.delete(baseURL + c.url);
          } else if (c.method.toUpperCase() === 'PATCH') {
            parsedMethod = agent.patch(baseURL + c.url);
          } else {
            callback('Test has an unrecognized method type');
            return asyncCallback();
          }

          if (isWithAuthentication) {
            loginBlock = function(loginCallback) {
              agent
                .post(baseURL + 'users/login')
                .send({email: c.username, password: c.password, ttl: '1209600000'})
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function(err, authRes) {
                  if (err) {
                    return loginCallback('Could not log in with provided credentials', null);
                  }

                  var token = authRes.body.id;

                  return loginCallback(null, token);
                });
            };
          } else {
            loginBlock = function(loginCallback) {
              return loginCallback(null, null);
            };
          }

          it(description, function(done) {
            loginBlock(function(loginError, loginToken) {
              if (loginError) {
                done(loginError);
                return asyncCallback();
              }

              if (loginToken) {
                parsedMethod = parsedMethod.set('Authorization', loginToken);
              }

              if (hasData) {
                parsedMethod = parsedMethod.send(c.withData)
                  .set('Content-Type', 'application/json');
              }

              if (c.expectObj) {
                parsedMethod
                  .expect(c.expect, c.expectObj)
                  .end(function(err, res) {
                    if (err) {
                      done(err);
                      return asyncCallback();
                    } else {
                      done();
                      return asyncCallback();
                    }
                  });
              } else {
                parsedMethod
                  .expect(c.expect)
                  .end(function(err, res) {
                    if (err) {
                      done(err);
                      return asyncCallback();
                    } else {
                      done();
                      return asyncCallback();
                    }
                  });
              }
            });
          });
        });
      });
    }
  },
};
