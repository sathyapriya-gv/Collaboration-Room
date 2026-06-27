const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    code: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      default: "javascript",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Code", codeSchema);