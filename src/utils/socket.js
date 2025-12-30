const socket = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Authentication middleware using cookies (based on userAuth)
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      
      if (!cookies) {
        return next(new Error("invalid credentials"));
      }

      // Parse cookies to extract token
      const cookieObj = {};
      cookies.split(";").forEach((cookie) => {
        const [key, value] = cookie.trim().split("=");
        cookieObj[key] = value;
      });

      const token = cookieObj.token;

      if (!token) {
        return next(new Error("Please Login"));
      }

      // Validate the token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const { _id } = decodedToken;

      // Find the user with the token
      const user = await User.findById(_id);
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = _id;
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err);
      return next(new Error("invalid credentials"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      // Verify the userId matches the authenticated user
      if (socket.userId !== userId) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // Verify the userId matches the authenticated user
        if (socket.userId !== userId) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        // Save messages to the database
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          // Check if users are connected
          const connection = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
              { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
            ],
          });

          if (!connection) {
            socket.emit("error", { message: "Users are not connected" });
            return;
          }

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (err) {
          console.log(err);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};

module.exports = initializeSocket;