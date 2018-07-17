const buildUrl = require('build-url');
const querystring = require('querystring');
const urls = require('./urls');
const timeSeriesData = require('../db/time_series_data');

// app/routes.js
module.exports = (app, passport) => {

  // Homepage
  app.get(urls.homepage, (req, res) => {
    res.render('index.ejs'); // load the index.ejs file
  });

  // Login
  app.get(urls.login, (req, res) => {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // Process the login form
  app.post(urls.login,
    isLoggedIn,
    (req, res, next) => {
      passport.authenticate('local-login', {
        failureFlash : true // allow flash messages
      }, (err, user) => {
        if (err) { return next(err); }
        // Redirect back to the login url if auth fails
        if (!user) { return res.redirect(req.originalUrl); }
        if (req.body.remember) {
         req.session.cookie.maxAge = 24 * 60 * 60; // 24 hours
        } else {
         req.session.cookie.expires = false;
        }
        // If the query string has a redirectUrl, else go to dashboard
        res.redirect(req.query.redirectUrl || urls.dashboard);
      })(req, res, next);
  });

  // Signup form
  app.get(urls.signup, (req, res) => {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // Submission of signup form
  app.post(urls.signup,
    passport.authenticate('local-signup', {
      failureRedirect : urls.signup, // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }), (req, res) => {
      // If the query string has a redirectUrl, else go to dashboard
      res.redirect(req.query.redirectUrl || urls.dashboard);
    }
  );

  // Use isLoggedIn middleware
  app.get(urls.dashboard,
    isLoggedIn,
    (req, res) => {
    res.send('WELCOME');
  });

  // Logout
  app.get(urls.logout, (req, res) => {
    req.logout();
    res.redirect(urls.homepage);
  });
  
  app.post('/api/login',
    (req, res, next) => {
      passport.authenticate('local-login', (err, user) => {
        if (err) {
          return next(err);
        }
        // Redirect back to the login url if auth fails
        if (!user) {
          return res.send({ success: false });
        }
        req.logIn(user, err => {
          if (err) {
            return next(err);
          }
          res.send({ success: true });
        });        
      })(req, res, next);
  });
  
  app.post('/api/insert',
    isLoggedIn,
    (req, res) => {
      timeSeriesData.insertData(req.body, (err, insertedRows) => {
        if (err) {
          return res.send({ success: false,  error: err });
        }
        return res.send({ success: true, insertedRows: insertedRows});
      });
  });
  
  // 404 Since no other routes have been hit
  app.use((req, res) => {
    res.status(404);

    // Respond with html page
    if (req.accepts('html')) {
      res.send('404: Not Found');
      return;
    }

    // Respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }

    // Default to plain-text. send()
    res.type('txt').send('Not found');
  });
};

// Check if the user is logged in
function isLoggedIn(req, res, next) {
  const isAuthenticated = req.isAuthenticated();

  // if user is authenticated in the session or this is the login page
  if (isAuthenticated || req.route.path === urls.login) {
    return next();
  }
  
  const redirectUrl = buildUrl({
    path: urls.login,
    queryParams: {
      redirectUrl: querystring.escape(req.originalUrl)
    }
  });
  
  res.redirect(redirectUrl);
}
