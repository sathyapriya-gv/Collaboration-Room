const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");

// Get attendance of one room
router.get("/:roomId", async (req, res) => {
  try {
    const data = await Attendance.find({
      roomId: req.params.roomId,
    }).sort({
      joinTime: -1,
    });

    res.json(data);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error fetching attendance",
    });
  }
});

module.exports = router;