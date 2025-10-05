const express = require('express');
const bcrypt = require('bcrypt');
const { userAuth } = require('../middleware/auth');
const { validateProfileEditData } = require('../utils/validation');
const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message);
  }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error('Invalid Edit request');
    }
    const loggedInUser = req.user;
    /*
    loggedInUser.firstName = req.body.firstName
    loggedInUser.lastName = req.body.lastName
    loggedInUser.gender = req.body.gender
    loggedInUser.photoUrl = req.body.photoUrl
    loggedInUser.about = req.body.about
    loggedInUser.age = req.body.age
    loggedInUser.skills = req.body.skills
    */

    // Optimized way to update the user profile
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();
    // res.send(loggedInUser.firstName + ', your profile updated successfully');

    // Response is sent in JSON format
    res.json({
      message: loggedInUser.firstName + ', your profile updated successfully',
      data: loggedInUser
    })
  } catch (err) {
    res.status(400).send('ERROR : '+ err.message);
  }
});

profileRouter.post('/profile/forgotPassword', userAuth, async (req, res) => {
  try {
    const hashPassword = req.user.password;

    const isCurrentPasswordValid = await bcrypt.compare(req.body.currentPassword, hashPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    const isSamePassword = await bcrypt.compare(req.body.newPassword, hashPassword);
    if (isSamePassword) {
      throw new Error('New password must be different from the current password');
    }
    req.user.password = await bcrypt.hash(req.body.newPassword, 10);
    await req.user.save();
    res.send('Password updated successfully');
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message);
  }
});

module.exports = profileRouter;