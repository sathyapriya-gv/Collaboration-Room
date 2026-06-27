const mongoose = require("mongoose");

const whiteboardSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    canvasData: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Whiteboard",
  whiteboardSchema
);