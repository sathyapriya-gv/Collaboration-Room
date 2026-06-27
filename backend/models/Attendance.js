const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },

  user: {
    type: String,
    required: true,
  },

  joinTime: {
    type: Date,
    required: true,
  },

  leaveTime: {
    type: Date,
    default: null,
  },

  duration: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);