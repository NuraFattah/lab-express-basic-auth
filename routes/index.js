const express = require('express');
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');
//const routeGuardMiddleware = require('./../middleware/route-guard');

//const { Router } = require('express');
const router = new express.Router();

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/register', (req, res, next) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  const name = req.body.name;
  const password = req.body.passwordH;
  // const { name, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then((passwordH) => {
      return User.create({
        name,
        passwordH
      });
    })
    .then((user) => {
      console.log('New user created', user);
      // Serialing the user
      req.session.userId = user._id;
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const { email, password } = req.body;
  let user;
  User.findOne({ email })
    .then((document) => {
      user = document;
      if (!user) {
        throw new Error('ACCOUNT_NOT_FOUND');
      } else {
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((comparisonResult) => {
      if (comparisonResult) {
        console.log('User was authenticated');
        req.session.userId = user._id;
        res.redirect('/');
      } else {
        throw new Error('WRONG_PASSWORD');
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/log-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
