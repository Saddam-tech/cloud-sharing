const express = require("express");
const router = express.Router();
const fs = require("fs");
const shell = require("shelljs");
const { messages } = require("../utils/messages");
const _ = require("lodash");
const { resperr, respok } = require("../utils/rest");
const db = require("../models");
const { create_uuid_via_namespace } = require("../utils/utils");

async function createJWT({ jfilter, userinfo }) {
  if (userinfo) {
  } else {
    userinfo = await db["users"].findOne({
      where: { ...jfilter },
      attributes: ["id", "username", "active", "uuid"],
      raw: true,
    });
  }

  if (!userinfo) {
    return false;
  }
  let expiresIn = "48h";

  let token = jwt.sign(
    {
      type: "JWT",
      ...userinfo,
    },
    process.env.JWT_SECRET,
    {
      expiresIn, // : "48h", // 3h",      // expiresIn: '24h',
      issuer: "EXPRESS",
    }
  );
  console.log("SECRET", process.env.JWT_SECRET);
  return {
    token,
    myinfo: userinfo,
  };
}

router.post("/signup", async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    resperr(res, messages.ARG_MISSING);
    return;
  }

  let respuser = await db["users"].findOne({
    raw: true,
    where: { username },
  });

  if (respuser) {
    resperr(res, messages.DUBLICATE_DATA);
    return;
  }
  let uuid = create_uuid_via_namespace(username);
  let user = await db["users"].create({
    username,
    password,
    uuid,
    active: 1,
  });

  let _user = await db["users"].findOne({
    raw: true,
    where: {
      username,
    },
  });
  let token = await createJWT({ userinfo: _user });
  if (token?.password) {
    delete token?.password;
  }

  respok(res, "CREATED", null, { respdata: { ...token } });
  return;
});

router.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    resperr(res, messages.ARG_MISSING);
    return;
  }

  let respuser = await db["users"].findOne({
    raw: true,
    where: {
      username,
      password,
    },
  });

  if (!respuser) {
    resperr(res, messages.NOT_FOUND);
    return;
  }

  let token = await createJWT({ userinfo: respuser });
  if (token?.password) {
    delete token?.password;
  }

  respok(res, null, null, { respdata: { ...token } });
  await db["sessions"].create({
    userid: respuser?.id,
    token: token?.token,
    active: 1,
    useruuid: respuser?.uuid,
  });
});

module.exports = router;
