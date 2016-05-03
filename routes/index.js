'use strict';

var express = require('express');
var router = express.Router();
// could use one line instead: var router = require('express').Router();
// var tweetBank = require('../tweetBank');
var path = require('path');
var bodyParser = require('body-parser');



module.exports = function (io, client) {

  function promiseQuery(query, valueArray){
    return new Promise(function (resolve, reject){
      client.query(query, valueArray, function(err, result){
        if(err) reject(err);
        else resolve(result);
      })
    })
  }
  // function promiseQuery(query, valueArray){
  //   return new Promise(function (resolve, reject){
  //     client.query(query, valueArray, func)
  //   })
  // }

  // function returnQueryObj(err, result){
  //   if(err) reject(err);
  //   else resolve(result);
  // }

  // function renderWithQueryObj(err, result) {
  //   if(err) console.error(err);
  //   var tweets = result.rows;
  //   res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
  // }

  router.use(express.static('public/')); //typical use for express static middleware
  
  router.use(bodyParser.urlencoded({ extended: false })); //parses request body encoding

  router.get('/', function (req, res) {
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id ORDER BY tweets.id', function (err, result) {
      if(err) console.error(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true});
    });
  });

  router.get( '/users/:name', function (req, res, next){
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE name=$1 ORDER BY tweets.id', [req.params.name], function (err, result) {
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
    var userID;

    promiseQuery('SELECT * FROM users WHERE name=$1', [req.body.name])
    .then(function(data){
      var queryObj = data.rowCount !== 0 ? data : promiseQuery('INSERT INTO users (name) VALUES ($1) RETURNING id', [req.body.name], function(err, result){
      if(err) console.error(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true }); 
      });
      return queryObj;
    })
    .then(function(result){
      console.log(result)
      userID = result.rows[0].id;
      return userID
      //check if user exists
    })
    .then(function(data){
      client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [data, req.body.text], function (err, result) {
        if(err) console.error(err);
        io.sockets.emit('new_tweet', { name: req.body.name, text: req.body.text});
        res.redirect('/');
      });
    })
    .catch(function(err){
      console.error(err);
    });
  });

  router.post('/retweet', function (req, res) {

    promiseQuery('SELECT * FROM tweets INNER JOIN users ON tweets.userid = users.id WHERE tweets.id=$1 ', [req.body.id])
    .then(function(data){
      client.query("INSERT INTO tweets (userid, content, parent) VALUES ($1, $2, $3)", [23, data.rows[0].content, data.rows[0].name], function (err, result) {
        if(err) console.error(err);
        io.sockets.emit('new_tweet', { name: "Kimber Kathy retweeted from: " + data.rows[0].name, text: data.rows[0].content});
        res.redirect('/');
      });
    })
    .catch(function(err){
      console.error(err);
    });

    
  });

  return router;
};