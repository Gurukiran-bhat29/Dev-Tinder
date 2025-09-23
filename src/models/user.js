const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50
  },
  lastName: {
    type: String
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: String,
    min: 18,
    max: 65
  },
  gender: {
    type: String,
    validate(value) {
      if (!['male', 'female', 'others'].includes(value)) {
        throw new Error('Gender is not valid..!')
      }
    }
  },
  photoUrl: {
    type: String,
    default: 'https://geographyandyou.com/images/user-profile.png'
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

const User = mongoose.model('User', userSchema);

module.exports = User;