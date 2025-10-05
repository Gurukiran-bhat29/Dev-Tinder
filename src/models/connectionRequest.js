const mongoose = require("mongoose");
const { default: next } = require("next");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId, // This refers to the _id field in the User model
      required: true,
      index: true
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId, // This refers to the _id field in the User model
      required: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

/*
 - This creates a compound index on { fromUserId, toUserId }
 - It means MongoDB creates a single index that covers both fields together.
 - 1 means in ascending order and -1 means in descending order
*/
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre('save', function(next) {
  const connectionRequest = this;
  // Check if the formUserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error('Cannot send the connection request to yourself..!!')
  }
  next();
})

/* 
  This will be called just before the DB save 
  Ex: 51 line in src\routes\request.js 
*/
const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
