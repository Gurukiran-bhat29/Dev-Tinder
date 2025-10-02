const express = require('express');
const { userAuth } = require('../middleware/auth');

const requestRouter = express.Router();

requestRouter.post('/sendConnectionRequest', userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + ' Sent the Connection request successfully');
})

module.exports = requestRouter;