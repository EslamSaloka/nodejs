const express = require('express');
const router = express.Router();
// bcrypt && passport
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
//Route Login && Register
router.get('/login',(req,res)=>res.render('login'));
router.get('/register',(req,res)=>res.render('register'));

// Register
router.post('/register', (req, res) => {
  // Get request keys From Form  
    const { name, email, password } = req.body;
    let errors = [];
  /*
  check if all element of key not to be null or empty
  */
    if (!name || !email || !password) {
      errors.push({ msg: 'Please enter all fields' });
    }
  // check if password is long of least 6 characters
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    // check if errors array is empty
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        email,
        password
      });
    } else {
      /**
       * check if this email is used
       */
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {
            errors,
            name,
            email,
            password
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/chat',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
req.logout();
req.flash('success_msg', 'You are logged out');
res.redirect('/users/login');
});
  
  module.exports = router;