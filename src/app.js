const express = require('express');

const app = express();

/* 
  Whenever the api call is made, it goes through a middleware
  GET /user => Middleware chain => request handler
  Whichever request handler has next() are considered 'Middleware'
*/

// Multiple route handlers
app.use(
  '/user',
  (req, res, next) => {

    // 1st scenario
    /* 
      res.send('1st response')
      next(); 
    */

    // 2nd scenario
    next();
    res.send('1st response')
  },
  (req, res) => {
    next();
    res.send('2nd response')
  },
  (req, res) => {
    // next();
    res.send('3rd response')
  })

// route handlers can be wrapped inside the array
app.use(
  '/user',
  [(req, res, next) => {
    res.send('1st response')
  },
  (req, res) => {
    next();
    res.send('2nd response')
  },
  (req, res) => {
    // next();
    res.send('3rd response')
  }]
)

// Even below kind of route handlers is possible
// app.use('/user', rh1, [rh2, rh3], rh4, rh5)

/* < -------------------------------------------------- > */

// '/test' use different route handling technique
app.get(
  '/test',
  (req, res, next) => {
    next();
    res.send('1st response')
  })

  app.get(
  '/test',
  (req, res) => {
    res.send('2nd response')
  })

  /* < -------------------------------------------------- > */

// Handle Auth Middleware for all GET POST,... requests
app.use("/admin", (req, res, next) => {
    console.log("Admin auth is getting checked!!");
    const token = "xyz";
    const isAdminAuthorized = token === "xyz";
    if (!isAdminAuthorized) {
        res.status(401).send("Unauthorized request");
    } else {
        next();
    }
});

app.get("/admin/getAllData", (req, res) => {
    res.send("All Data Sent");
});

app.get("/admin/deleteUser", (req, res) => {
    res.send("Deleted a user");
});

  /* < -------------------------------------------------- > */

  // Error handling
  app.use('/', (err, req, res, next) => {
    if (err) {
      res.status(500).send("something went wrong");
    }
  })

app.listen('7070', () => {
  console.log('Server is running on port 7070')
})
