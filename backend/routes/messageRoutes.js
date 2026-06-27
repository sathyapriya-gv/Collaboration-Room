const express = require("express");
const router = express.Router();

const Message = require("../models/Message");

router.get("/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({
      roomId: req.params.roomId,
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
