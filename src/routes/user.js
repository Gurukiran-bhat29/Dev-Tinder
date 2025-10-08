const express = require("express");
const { userAuth } = require("../middleware/auth");
const userRouter = express.Router();
const ConnectionRequest = require('../models/connectionRequest')
const User = require("../models/user");

const USER_SAFE_DATA = ['firstName', 'lastName', 'emailId', 'photoUrl', 'about'];

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested'
    }).populate('fromUserId', ["firstName", "lastName"]) // Here populate will send the whole user object if 2nd arguement is not mentioned

    res.json({
      message: 'Data fetched successfully',
      data: connectionRequests
    })
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: 'accepted'},
        { fromUserId: loggedInUser._id, status: 'accepted'},
      ]
    })
    .populate("fromUserId", USER_SAFE_DATA)
    .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map(row => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });

  } catch (err) {
    res.status(400).send('ERROR: ' + err.message)
  }
})

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // Max limit is 50

    const skip = (page - 1) * limit;

    // Find all the connection request (sent + received) of the loggedIn user
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id},
        { toUserId: loggedInUser._id},
      ]
    })
    .select(['fromUserId', 'toUserId'])
    // .populate("fromUserId", ['firstName', 'lastName']) NOTE: It can be used if you want to see the user details
    // .populate("toUserId", ['firstName', 'lastName']);

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach(req => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    })
    
    const users = await User.find({
      // This will exclude the loggedIn user and the users with whom the connection request is sent or received
      // Array.from is used to convert the set into array
      // $nin -> Not in this array and $ne -> Not equal to this value
      $and: [
        { _id: { $ne: loggedInUser._id } },
        { _id: { $nin: Array.from(hideUsersFromFeed) } }
      ]
    }).select(USER_SAFE_DATA).skip(skip).limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).send('ERROR: ' + err.message)
  }
})

module.exports = userRouter;
