const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "File",
  fileSchema
);