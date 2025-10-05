const express = require('express');
const { validateSignUpData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');

const authRouter = express.Router();

authRouter.post('/signUp', async (req, res) => {
  const { firstName, lastName, emailId, password, gender } = req.body;
  try {
    validateSignUpData(req);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      gender,
      password: passwordHash,
    })

    await user.save();
    res.send('User added successfully')
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message)
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error('Invalid credentials');
    } 

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie('token', token, { expires: new Date(Date.now() + 8 * 3600000) }); // Cookie will expire in 8 hours
      res.send("Login Successful...!!!");
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message)
  }
})

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  // res.cookie('token', null, { expires: new Date(Date.now()) });
  res.send('Logout Successful...!!!');
})

module.exports = authRouter;