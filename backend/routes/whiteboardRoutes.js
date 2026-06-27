const express = require("express");
const router = express.Router();

const Whiteboard = require("../models/Whiteboard");

router.get("/:roomId", async (req, res) => {
  try {
    const board = await Whiteboard.findOne({
      roomId: req.params.roomId,
    });

    res.json(board || {});
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;