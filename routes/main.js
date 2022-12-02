const express = require("express");
const router = express.Router();
const fs = require("fs");
const shell = require("shelljs");
const _ = require("lodash");
const { auth } = require("../utils/authMiddleware");
const db = require("../models");
const { create_uuid_via_namespace } = require("../utils/utils");
const { messages } = require("../utils/messages");
const { respok } = require("../utils/rest");

router.get("/", async (req, res) => {
  console.log("Main Webpage");
  res.send("Welcome to the Cloud Share!!!");
});

router.post("/upload", auth, async (req, res) => {
  try {
    let { id, uuid } = req.decoded.dataValues;
    if (!id || !uuid) {
      res.send({
        status: false,
        message: "USER NOT FOUND!",
      });
      return;
    }
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded!",
      });
    } else {
      let data = [];
      const path = `/Users/saddam/Desktop/uploads/${uuid}/`;
      if (!fs.existsSync(path)) {
        shell.mkdir("-p", path);
      }

      _.forEach(_.keysIn(req.files.file), (key) => {
        let file = req.files.file[key];
        let itemuuid = create_uuid_via_namespace(file.name);
        file.mv(path + file.name);
        data.push({
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
          userid: id,
          useruuid: uuid,
          uuid: itemuuid,
          url: path + file.name,
        });
      });
      console.log("File upload detected!", data);

      await db["files"].bulkCreate(data);

      respok(res, "Files are uploaded", null, data);
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/my/files", auth, async (req, res) => {
  try {
    let { uuid: useruuid } = req.decoded.dataValues;
    if (!useruuid) {
      res.send({
        status: false,
        message: messages.ARG_MISSING,
      });
      return;
    }
    let response = await db["files"].findAll({
      raw: true,
      where: { useruuid },
    });
    respok(res, null, null, { response, payload: { count: response.length } });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
