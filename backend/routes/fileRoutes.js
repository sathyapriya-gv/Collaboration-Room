const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");

const router = express.Router();

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname
    );
  },
});

const upload = multer({
  storage,
});

// Upload File
router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const { roomId } = req.body;

      const newFile =
        await File.create({
          roomId,
          fileName:
            req.file.originalname,
          filePath:
            req.file.filename,
        });

      res.json(newFile);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "File upload failed",
      });
    }
  }
);

// Get Files Of Room
router.get(
  "/:roomId",
  async (req, res) => {
    try {
      const files =
        await File.find({
          roomId:
            req.params.roomId,
        });

      res.json(files);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Failed to fetch files",
      });
    }
  }
);
// Delete File
router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    // Delete physical file
    const filePath = path.join(
      __dirname,
      "../uploads",
      file.filePath
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete MongoDB record
    await File.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      id: req.params.id,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Delete failed",
    });
  }
});
module.exports = router;