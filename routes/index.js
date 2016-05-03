'use strict';

var express = require('express');
var router = express.Router();
// could use one line instead: var router = require('express').Router();
// var tweetBank = require('../tweetBank');
var path = require('path');
var bodyParser = require('body-parser');

module.exports = function (io, client) {

  router.use(express.static('public/')); //typical use for express static middleware
  
  router.use(bodyParser.urlencoded({ extended: false })); //parses request body encoding

  router.get('/', function (req, res) {
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id', function (err, result) { 
      if(err) console.error(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  router.get( '/users/:name', function (req, res, next){
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE name=$1', [req.params.name], function (err, result) { 
      if(err) console.error(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  router.get( '/tweet/:uniqID', function (req, res, next){
    var idNum = +req.params.uniqID
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE tweets.id=$1', [idNum], function (err, result) { 
      if(err) console.error(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  router.post('/tweets', function (req, res) {
    //check if user exists (by name)
    var userID;
    client.query('SELECT * FROM users WHERE name=$1', [req.body.name], function (err, result) {
      if(result.rowCount === 0) {
        client.query('INSERT INTO users (name) VALUES ($1) RETURNING id', [req.body.name], function (err, result) {
          if(err) console.error(err);
          console.log(result);
          userID = result.rows[0].id;
        });
      } else {
        userID = result.rows[0].id;
      };
      console.log(userID);
      // client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [userID, req.body.text], function (err, result) { 
      //   if(err) console.error(err);
      //   io.sockets.emit('new_tweet', { name: req.body.name, text: req.body.text});
      //   res.redirect('/');
      // });
    });
      //does not exist? insert user
    //get user id by name
    //insert into tweets by userid and content

    //socket with name and content

    

    // tweetBank.add(req.body.name, req.body.text);
    
  });



  return router;
};