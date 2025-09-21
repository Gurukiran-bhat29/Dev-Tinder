const express = require('express');
const connectDb = require('./config/database');
const User = require('./models/user');

const app = express();

/* <------------------- Here request data is being harcoded -------------------> */
// app.post('/signUp', async (req, res) => {

/* <---------- creating a new instance of the User model ----------> */

//   const user = new User({
//     firstName: 'Gurukiran',
//     lastName: 'Bhat',
//     emailId: 'guru@gmail.com',
//     password: 'password@123',
//   });

//   try {
//     await user.save();
//     res.send('User added successfully')
//   } catch (err) {
//     res.status(400).send('Error saving the user '+ err.message)
//   }
// })

// This middleware will be activated for the routes since app.use will run on all the route handlers
// The request.body will be in the form of readable stream and we need to convert it to json()
app.use(express.json());

app.post('/signUp', async (req, res) => {
  console.log('Body', req.body)
  const user = new User(req.body);

  try {
    await user.save();
    res.send('User added successfully')
  } catch (err) {
    res.status(400).send('Error saving the user ' + err.message)
  }
})

// Get user by email
app.get('/user', async (req, res) => {
  try {
    const userEmail = req.body.email;
    const users = await User.find({ emailId: userEmail })

    if (users.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.send(users);
    }
  } catch (err) {
    console.error('Something went wrong', err)
  }
})

// Feed API - Get /feed - get all the users from the database
app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({})
    if (users.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.send(users);
    }
  } catch (err) {
    console.error('Something went wrong', err)
  }
})


// Delete a user from Database
app.delete('/user', async (req, res) => {
  const userId = req.body.userId;
  try {
    // const user = await User.findByIdAndDelete({ _id: userId })
    const user = await User.findByIdAndDelete(userId)
    res.send('User deleted successfully');
  } catch (err) {
    console.error('Something went wrong', err);
  }
})

// Update a user to Database
app.patch('/user', async (req, res) => {
  const data = req.body;
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndUpdate({ _id: userId }, data);
    console.log('user', user);

    const userBefore = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: 'before'
    });
    console.log('Before document', userBefore);

    const userAfter = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: 'after'
    });
    console.log('Before document', userAfter);

    res.send('User update successfully');
  } catch (err) {
    console.error('Something went wrong', err);
  }
})

connectDb().then(() => {
  console.log('Database connected successfully')
  app.listen('7070', () => {
    console.log('Server is running on port 7070')
  })
}).catch(err => {
  console.error('Database cannot be connected', err)
})
