const express = require("express");
const router = express.Router();
const Code = require("../models/Code");

router.get("/:roomId", async (req, res) => {
  try {
    const roomCode = await Code.findOne({
      roomId: req.params.roomId,
    });

    res.json(roomCode || {});
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;