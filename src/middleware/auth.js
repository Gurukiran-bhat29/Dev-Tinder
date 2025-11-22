const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
  try {
    // Read the token from cookie
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please Login");
    }

    // Validate the token
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    const { _id } = decodedToken;

    // Find the user with the token
    const user = await User.findById(_id);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    next();
  } catch (err) {
    console.log('Auth Middleware Error:', err);
    res.status(400).send('ERROR : ' + err.message);
  }
}

module.exports = { userAuth };