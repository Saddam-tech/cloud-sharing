const express = require("express");
const router = express.Router();
const fs = require("fs");
const shell = require("shelljs");
const _ = require("lodash");

router.get("/", async (req, res) => {
  console.log("Main Webpage");
  res.send("Welcome to the Cloud Share!!!");
});

router.post("/upload", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded!",
      });
    } else {
      let data = [];
      const path = "/Users/saddam/Desktop/uploads/";
      if (!fs.existsSync(path)) {
        shell.mkdir("-p", path);
      }

      _.forEach(_.keysIn(req.files.file), (key) => {
        let file = req.files.file[key];

        file.mv(path + file.name);
        data.push({
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
      console.log("File upload detected!", data);

      res.send({
        status: true,
        message: "Files are uploaded",
        data,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
