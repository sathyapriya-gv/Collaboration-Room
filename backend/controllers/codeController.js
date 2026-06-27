const axios = require("axios");

const runCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: language,
        version: "*",
        files: [
          {
            content: code,
          },
        ],
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: "Code Execution Failed",
    });
  }
};

module.exports = { runCode };