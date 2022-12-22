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

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const hostname = "15.164.222.234";

const bucket_name = process.env.BUCKET_NAME;
const bucket_region = process.env.BUCKET_REGION;
const access_key = process.env.ACCESS_KEY;
const secret_access_key = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: secret_access_key,
  },
  region: bucket_region,
});

router.get("/", async (req, res) => {
  console.log("Main Webpage");
  res.send("Welcome to CloudShare!!!");
});

router.post("/upload", auth, async (req, res) => {
  try {
    console.log("dataValues", req.decoded.dataValues);
    console.log("req.decoded", req.decoded);
    let { id, uuid } = req.decoded;
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
      let file;
      let params;
      let itemuuid;
      let command;
      // const path = `/home/ubuntu/resource/uploads/${uuid}/`;
      // if (!fs.existsSync(path)) {
      //   shell.mkdir("-p", path);
      // }
      if (!Array.isArray(req.files.file)) {
        file = req.files.file;
        itemuuid = create_uuid_via_namespace(id + file.name);
        // file.mv(path + file.name);
        params = {
          Bucket: bucket_name,
          Key: itemuuid,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        data.push({
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
          userid: id,
          useruuid: uuid,
          uuid: itemuuid,
          // url: urltos3,
        });
        command = new PutObjectCommand(params);
        await s3.send(command);
      } else {
        _.forEach(_.keysIn(req.files.file), async (key) => {
          file = req.files.file[key];
          itemuuid = create_uuid_via_namespace(id + file.name);
          params = {
            Bucket: bucket_name,
            Key: itemuuid,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          // file.mv(path + file.name);
          data.push({
            name: file.name,
            mimetype: file.mimetype,
            size: file.size,
            userid: id,
            useruuid: uuid,
            uuid: itemuuid,
            // url: urltos3,
          });
          command = new PutObjectCommand(params);
          await s3.send(command);
        });
      }

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
    let { uuid: useruuid } = req.decoded;
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
