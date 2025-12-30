const express = require("express");
const Chat = require("../models/chat");
const { userAuth } = require("../middleware/auth");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    // Get total message count
    const totalMessages = chat.messages.length;
    const totalPages = Math.ceil(totalMessages / limit);

    // Get paginated messages (latest first)
    const paginatedMessages = chat.messages
      .slice(-skip - limit, totalMessages - skip || undefined)
      .reverse();

    // Populate sender details
    await Chat.populate(paginatedMessages, {
      path: "senderId",
      select: "firstName lastName",
    });

    res.json({
      messages: paginatedMessages,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        hasMore: page < totalPages,
      },
      participants: chat.participants,
    });
  } catch (err) {
    res.status(500).send("ERROR : " + err.message);
  }
});

module.exports = chatRouter;