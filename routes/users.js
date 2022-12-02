const express = require("express");
const router = express.Router();
const fs = require("fs");
const shell = require("shelljs");
const { messages } = require("../utils/messages");
const _ = require("lodash");
const { resperr, respok } = require("../utils/rest");
const db = require("../models");
const {
  create_uuid_via_namespace,
  generaterandomhex,
} = require("../utils/utils");
const jwt = require("jsonwebtoken");
const users = require("../models/users");

async function createJWT({ jfilter, userinfo }) {
  if (userinfo) {
  } else {
    userinfo = await db["users"].findOne({
      where: { ...jfilter },
      attributes: ["id", "active", "uuid"],
      raw: true,
    });
  }

  if (!userinfo) {
    return false;
  }
  let expiresIn = "24h";
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

router.post("/signin", async (req, res) => {
  let { password } = req.body;

  if (!password) {
    resperr(res, messages.ARG_MISSING);
    return;
  }

  try {
    let randomhex = generaterandomhex(10);
    let uuid = create_uuid_via_namespace(randomhex + password);
    let user = await db["users"].create({
      password,
      uuid,
      active: 1,
    });
    let token = await createJWT({ userinfo: user });
    await db["sessions"].create({
      userid: user?.id,
      token: token?.token,
      active: 1,
      useruuid: uuid,
    });
    if (token?.myinfo?.password) {
      delete token.myinfo?.password;
    }
    console.log("USER SIGNIN ::");
    console.log({
      user: user.id,
      password: user.password,
      uuid: user.uuid,
      active: user.active,
    });
    respok(res, "CREATED", null, { respdata: { ...token } });
    return;
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
