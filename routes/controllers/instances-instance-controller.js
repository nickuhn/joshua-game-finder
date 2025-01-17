var mongoose = require('mongoose');
var Instance = require(__dirname + '/../../models/Instance.js');
var User = require(__dirname + '/../../models/User.js');

module.exports = {

  get: function(req, res) {
    Instance.findOne({_id: req.params.instance}, function(err, data) {
      if (err) {
        res.status(500).json({success: false, msg: 'Error finding instance', error: err});
      } else {
        res.json({success: true, msg: 'Get instance successful', data: data});
      }
    });
  },

  delete: function(req, res) {
    Instance.findOne({_id: req.params.instance}, function(err, instance) {
      if (err) {
        res.status(500).json({success: false, msg: 'Error finding instance', error: err});
      } else {
        if (req.decoded._id != instance.creator) {
          res.status(403).json({success: false, msg: 'User does not have access to this file'});
        } else {
          instance.participants.forEach(function(e) {
            User.findOneAndUpdate({_id: e}, {isCommitted:false}, function(err, numAffected) {
              if (err) {
                return res.status(500).json({success: false, msg: 'Error updating instance', error: err});
              }
            });
          });
          Instance.remove({_id: req.params.instance}, function(err, data) {
            if (err) {
              res.status(500).json({success: false, msg: 'Error deleting instance', error: err});
            } else {
              res.json({success: true, msg: 'Delete instance successful', data: data});
            }
          });
        }
      }
    })
  },

  put: function(req, res) {
    Instance.findOne({_id: req.params.instance}, function(err, instance) {
      if (err) {
        res.status(500).json({success: false, msg: 'Error finding instance', error: err});
      } else if (instance.gameOver === true) {
        // Cannot edit if gameOver is true
        res.status(403).json({msg: 'Game already marked as over changes not allowed'});
      } else {
        // Must be the creator of the instance to edit it
        if (req.decoded._id != instance.creator) {
          res.status(403).json({success: false, msg: 'User does not have access to this file'});
        } else {
          Instance.update(instance, req.body, function(err, numAffected) {
            if (err) {
              res.status(500).json({success: false, msg: 'Error updating instance', error: err});
            } else {
              Instance.findOne({_id: req.params.instance}, function(err, instance) {
                if (err) {
                  res.status(500).json({success: false, msg: 'Error finding instance', error: err});
                } else {
                  if (instance.gameOver === true) {
                    User.findOneAndUpdate({_id: instance.creator}, {hosting: false, isCommitted: false}, function(err, numAffected) {
                      if (err) {
                        return res.status(500).json({success: false, msg: 'Error updating host status', error: err});
                      }
                    });
                    instance.participants.forEach(function(e) {
                      User.findOneAndUpdate({_id: e}, {isCommitted:false}, function(err, numAffected) {
                        if (err) {
                          return res.status(500).json({success: false, msg: 'Error updating instance', error: err});
                        }
                      });
                    });
                  }
                  res.json({success: true, msg: 'Get all instances successful', data: instance});
                }
              });
            }
          });
        }
      }
    });
  },

  join: function(req, res) {
    User.findOne({_id: req.decoded._id}, function(err, data) {
      if (err) {
        res.status(500).json({success: false, msg: 'Error finding instances', error: err});
      } else {
        if (data.isCommitted === false) {
          Instance.findOne({_id: req.params.instance}, function(err, instance) {
            if (instance.signedUp === instance.playersNeeded) {
              res.status(403).json({msg: 'Max number of players already reached'});
            } else if (instance.gameOver === true) {
              res.status(403).json({msg: 'Game already over'});
            } else {
              User.findOneAndUpdate({_id: req.decoded._id}, {isCommitted: true},
                function(err, numAffected) {
                if (err) {
                  return res.status(500).json({success: false, msg: 'Error finding user', error: err});
                }
              });
              Instance.findOne({_id: req.params.instance}, function(err, instance) {
                if (err) {
                  res.status(500).json({success: false, msg: 'Error finding instance', error: err});
                } else {
                  instance.participants.push(req.decoded._id);
                  instance.signedUp = instance.participants.length;
                  instance.save();
                  res.json({success: true, msg: 'Added user to instance', data: instance});
                }
              })
            }
          })
        } else {
          res.status(403).json({msg: 'User is committed to another game'});
        }
      }
    });
  },

  quit: function(req, res) {
    Instance.findOne({_id: req.params.instance}, function(err, instance) {
      if (err) {
        return res.status(500).json({success: false, msg: 'Error finding instance', error: err})
      } else {
        instance.participants.forEach(function(participant) {
          if (participant == req.decoded._id) {
            User.findOneAndUpdate({_id: req.decoded._id}, {isCommitted: false}, function(err, numAffected) {
              if (err) {
                return res.status(500).json({success: false, msg: 'Error finding user', error: err});
              } else {
                instance.participants.pull(req.decoded._id);
                instance.signedUp = instance.participants.length;
                instance.save();
                res.json({success: true, msg: 'Removed user from instance', data: instance});
              }
            });
          }
        });
      }
    });
  }

};
