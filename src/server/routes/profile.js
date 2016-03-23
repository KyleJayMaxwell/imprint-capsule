var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/imprints';
var knex = require('../../../db/knex');
var queries = require('./queries');
var queriesag = require('../queries/ag_queries');
var util = require('../helpers/util');
var passport = require('passport');


//get new user/registration page
router.get('/new', function(req, res, next) {
  var id = req.params.id;
  res.render('users/new', { title: 'Add User Profile' });
});


//add new user to database via registration
router.post('/new', function(req,res,next) {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var hashedPW = util.hashing(req.body.password);
  var img = req.body.img;
  var bio = req.body.bio;
  queriesag.addUser(fname,lname,email,hashedPW,img,bio)
    .then(function() {
      passport.authenticate('local', function (err, user){
        if (err) {
          return next(err);
        } else {
          console.log('user line 33', user);
          req.logIn(user, function(err) {
            if (err) {
              return next(err);
            } else {
              return res.redirect('/');
            }
          });
        }
    }) (req, res, next);
  });
});

// display user information on edit page
router.get('/:id/edit', function(req, res, next) {
  var id = req.params.id;
  console.log('line 49 id',id);
  queriesag.getSingleUser(id).then(function(results) {
  res.render('users/edit', { title: 'Edit User Profile', results:results });
  });
});

//edit user information on the edit page
router.post('/:id/edit', function(req, res, next) {
  var id = req.params.id;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var password = req.body.password;
  var img = req.body.img;
  var bio = req.body.bio;
  queriesag.editUser(id,fname,lname,email,password,img,bio).then(function(results) {
  res.redirect('/profile/'+id);
  })
});


//delete user
router.post('/:id/delete', function(req,res,next) {
  var id = req.params.id;
  queriesag.deleteUser(id).then(function() {
    res.redirect('/')
  })
});


//display a single user's page
router.get('/:id', function(req, res, next) {
  var id = req.params.id;
 queriesag.getSingleUser(id).then(function(results) {
   var count = results.length;
   var eid = results[0].e_id;
   res.render('users/profile', { title: 'Show User Profile'+id, results: results, count:count, eid:eid, id: id });
  })

});

//show all users on the page
router.get('/', function(req, res, next) {
 queriesag.getAllUserPage().then(function(results) {
 res.render('users/all', { title: 'Meet Our Visitors', array: results });
  })
});



module.exports = router;
