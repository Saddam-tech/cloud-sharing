const express = require("express");
const router = express.Router();
const fs = require("fs");
const shell = require("shelljs");

router.get("/", async (req, res) => {
  console.log("Main Webpage");
  res.send("Welcome to the main page!!!");
});

router.post("/upload", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded!",
      });
    } else {
      let file = req.files.file;
      const path = "/Users/saddam/Desktop/uploads/";
      if (!fs.existsSync(path)) {
        shell.mkdir("-p", path);
      }
      file.mv(path + file.name);
      console.log("File upload detected!", { file: file.name });

      res.send({
        status: true,
        message: "File is uploaded",
        data: {
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
