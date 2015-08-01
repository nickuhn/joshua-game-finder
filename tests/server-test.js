var fs               = require('fs');
var chai             = require('chai');
var mocha            = require('mocha');
var User             = require(__dirname + '/../models/User');
var Instance         = require(__dirname +'/../models/Instance')
var server           = require(__dirname + '/../server');
var chaiHttp         = require('chai-http');
var mongoose         = require('mongoose');
var expect           = chai.expect;
process.env.DATABASE = 'mongodb://localhost/game_test2';
chai.use(chaiHttp);

var testy = {
  username: 'phil',
  password: 'password123',
  email: 'sirtestsalot@email.com',
  firstName: 'Sirtests',
  lastName: 'Alot',
  city: 'Seattle',
  state: 'WA'
};

var zesty = {
  username: 'zesty',
  password: 'password123',
  email: 'zesty@email.com',
  firstName: 'zesty',
  lastName: 'zesty',
  city: 'Seattle',
  state: 'WA'
};

var nesty = {
  username: 'nesty',
  password: 'password123',
  email: 'nesty@email.com',
  firstName: 'nesty',
  lastName: 'nesty',
  city: 'Seattle',
  state: 'WA'
};

var testInstance = {
  host: 'Me',
  game: 'Go Fish',
  location: 'There',
  playersNeeded: '2',
  signedUp: '1',
  startTime: '14:00',
  playTime: '2hrs',
  gameOver: false
};

var token = '';
var token2 = '';

describe('Users REST API', function() {

  before(function(done) {
    testUser = new User({
      username: 'uncletester',
      password: 'password321',
      email: 'uncletester@email.com',
      firstName: 'Uncle',
      lastName: 'Tester',
      city: 'Seattle',
      state: 'WA'
    });

    testUser.save(function(err, data) {
      if (err) throw err;
      testUser = data;
    });
      done();
  });

/********************************************************
/    User Tests
/********************************************************/

  it('should respond to POST /users by storing and returning a user', function(done) {
    chai.request('localhost:3000')
      .post('/api/users')
      .send(testy)
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      });
  });

  it('Should respond to a POST /login by issuing a token', function(done) {
    chai.request('localhost:3000')
      .post('/auth/login')
      .send({username: 'phil', password: 'password123'})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        token = res.body.token;
        done();
      })
  })

  // Create a second user so he can join an instance
  it('Should respond to a POST /login by issuing a token', function(done) {
    chai.request('localhost:3000')
      .post('/api/users')
      .send(zesty)
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        token2 = res.body.token;
        done();
      })
  })

  it('should respond to GET /users by returning list of all users', function(done) {
    chai.request('localhost:3000')
      .get('/api/users')
      .send({token: token})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      });
  });


  it('should respond to GET /users/:user that user\'s info', function(done) {
    chai.request('localhost:3000')
      .get('/api/users/phil')
      .send({token: token})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      });
  });

  it('should respond to a PUT /users/:user by updating that user', function(done) {
    chai.request('localhost:3000')
      .put('/api/users/phil')
      .set('x-access-token', token)
      .send({email: 'my_new_email@email.com'})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      })
  })

  it('should respond to a DELETE /users/:user by deleting that user', function(done) {
    chai.request('localhost:3000')
      .del('/api/users/sirtestsalot')
      .send({token: token})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      });
  });

});

/********************************************************
/    Instance Tests
/********************************************************/


describe('Instances REST API', function() {
  testId = '';
  testId2 = '';

  testInstance2 = new Instance({
      host: 'phil',
      game: 'somethingelse',
      location: 'Here',
      playersNeeded: '3',
      signedUp: '0',
      startTime: '14:00',
      playTime: '2hrs',
      gameOver: false
    });

  testInstance3 = new Instance({
      host: 'phil',
      game: 'anotherGame',
      location: 'Here',
      playersNeeded: '3',
      signedUp: '0',
      startTime: '14:00',
      playTime: '2hrs',
      gameOver: false
    });

  before(function(done) {
    testInstance = new Instance({
      host: 'Tester',
      game: 'game',
      location: 'Here',
      playersNeeded: '1',
      signedUp: '0',
      startTime: '14:00',
      playTime: '2hrs',
      gameOver: false
    });

    testInstance.save(function(err, data) {
      if (err) throw err;
      testInstance = data;
      testId = testInstance._id;
    });
      done();
  });

  it('should respond to GET /instances by returning list of all instances', function(done) {
    chai.request('localhost:3000')
      .get('/api/instances')
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      });
  });

  it('should respond to POST /instances by storing and returning a instance', function(done) {
    chai.request('localhost:3000')
      .post('/api/instances')
      .set('x-access-token', token)
      .send(testInstance2)
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        // Assign testId2
        testId2 = res.body.data._id;
        User.findOne({username: "phil"}, function(err, data) {
          if (err) throw err;
          expect(data.hosting).to.eql(true);
          expect(data.isCommitted).to.eql(true);
          done();
        });
      });
  });

  it('should not allow users to POST /instances if isCommitted is "true"', function(done) {
    chai.request('localhost:3000')
      .post('/api/instances')
      .set('x-access-token', token)
      .send(testInstance3)
      .end(function(err, res) {
        expect(res.status).to.eql(403);
        expect(res).to.be.json;
        User.findOne({username: "phil"}, function(err, data) {
          if (err) throw err;
          expect(data.hosting).to.eql(true);
          expect(data.isCommitted).to.eql(true);
          done();
        });
      });
  });

  it('should respond to GET /instances/:instance that instance\'s info', function(done) {
    chai.request('localhost:3000')
      .get('/api/instances/' + testId)
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      });
  });

  it('should respond to PUT /instances by storing and returning a instance', function(done) {
    chai.request('localhost:3000')
      .put('/api/instances/' + testId2)
      .set('x-access-token', token)
      .send({game: "changed", startTime: "11:00"})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        done();
      });
  });

  it('should not allow users to PUT /instances/:instance/join if isCommitted is "true"',
      function(done) {
      chai.request('localhost:3000')
        .put('/api/instances/' + testId + '/join')
        // phil attempts to join the game but fails
        .set('x-access-token', token)
        .send()
        .end(function(err, res) {
          expect(res.status).to.eql(403);
          expect(res).to.be.json;
          User.findOne({username: "phil"}, function(err, data) {
            if (err) throw err;
            expect(data.hosting).to.eql(true);
            expect(data.isCommitted).to.eql(true);
            done();
          });
        });
  })

  it('should respond to a PUT /instances/:instance/join by adding a user\'s ' +
      'id to the participants array on the Instance and change the user\'s ' +
      'field "isCommitted" to true', function(done) {
      chai.request('localhost:3000')
        .put('/api/instances/' + testId2 + '/join')
        .set('x-access-token', token2)
        .send()
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.status).to.eql(200);
          expect(res).to.be.json;
          expect(res.body.data.participants).to.have.length(1);
          expect(res.body.data.signedUp).to.eql(1);
          User.findOne({username: "zesty"}, function(err, data) {
            if (err) throw err;
            expect(data.hosting).to.eql(false);
            expect(data.isCommitted).to.eql(true);
            done();
          });
        })
  })

  it('should respond to a PUT /instances/:instance/quit by removing a user\'s ' +
      'id from the participants array on the Instance and change the user\'s ' +
      'field "isCommitted" to false', function(done) {
      chai.request('localhost:3000')
        .put('/api/instances/' + testId2 + '/quit')
        .set('x-access-token', token2)
        .send()
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.status).to.eql(200);
          expect(res).to.be.json;
          expect(res.body.data.participants).to.have.length(0);
          expect(res.body.data.signedUp).to.eql(0);
          User.findOne({username: "zesty"}, function(err, data) {
            if (err) throw err;
            expect(data.hosting).to.eql(false);
            expect(data.isCommitted).to.eql(false);
            done();
          });
        })
  })

  it('should respond to a DELETE /instances/:instance by deleting that instance', function(done) {
    chai.request('localhost:3000')
      .del('/api/instances/' + testId2)
      .send({token: token})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res).to.be.json;
        expect(res.body.success).to.eql(true);
        // All participants and host should be released
        done();
      });
  });

  // after(function(done) {
  //   mongoose.connection.db.dropDatabase(function() {
  //     done();
  //   });
  // });

});
