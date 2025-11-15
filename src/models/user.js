const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
    index: true // Query will much faster if the DB gets big
  },
  lastName: {
    type: String
  },
  emailId: {
    type: String,
    required: true,
    unique: true, // mongodb will internally add the index: true, so we can avoid adding index if the type is unique
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email address' + value);
      }
    }
  },
  password: {
    type: String,
    required: true,
    validate(value) {
      // if (!validator.isStrongPassword(value)){
      //   throw new Error('Enter a strong passoword' + value);
      // }
    }
  },
  age: {
    type: String,
    min: 18,
    max: 65
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female", "others"],
      message: `{VALUE} is not a valid gender type`
    },
    // validate(value) {
    //   if (!['male', 'female', 'others'].includes(value)) {
    //     throw new Error('Gender is not valid..!')
    //   }
    // }
  },
  photoUrl: {
    type: String,
    default: 'https://geographyandyou.com/images/user-profile.png',
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error('Invalid photo URL:' + value);
      }
    }
  },
  about: {
    type: String,
    default: "This is default about of the user!"
  },
  skills: {
    type: [String]
  }
}, {
  timestamps: true
})

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id },
    'your_jwt_secret_key', { expiresIn: '7d' }
  );
  return token;
}

userSchema.methods.validatePassword = async function (inputPassword) {
  const user = this;
  const hashPassword = user.password;

  const isPasswordValid = await bcrypt.compare(inputPassword, hashPassword);
  return isPasswordValid;
}

const User = mongoose.model('User', userSchema);

module.exports = User;