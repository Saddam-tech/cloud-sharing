const express = require("express");
const router = express.Router();
const fs = require("fs");
const shell = require("shelljs");
const { messages } = require("../utils/messages");
const _ = require("lodash");
const { resperr, respok } = require("../utils/rest");
const { auth } = require("../utils/authMiddleware");
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
  let { username, password } = req.body;

  if (!username || !password) {
    resperr(res, messages.ARG_MISSING);
    return;
  }

  try {
    let user = await db["users"].findOne({
      raw: true,
      where: { username, password },
    });
    if (!user) {
      resperr(res, messages.NOT_FOUND);
      return;
    }
    let token = await createJWT({ userinfo: user });
    await db["sessions"].create({
      userid: user?.id,
      token: token?.token,
      active: 1,
      useruuid: user.uuid,
    });
    if (token?.myinfo?.password) {
      delete token?.myinfo?.password;
    }
    console.log("USER SIGNIN ::");
    console.log({
      user: user.id,
      username,
      password,
      uuid: user.uuid,
      active: user.active,
    });
    respok(res, "SIGNED IN!", null, { respdata: { ...token } });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/signup", async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      resperr(res, messages.ARG_MISSING);
      return;
    }

    let user;

    user = await db["users"].findOne({
      raw: true,
      where: { username, password },
    });
    if (user) {
      resperr(res, messages.DUBLICATE_DATA);
      return;
    }

    let randomhex = generaterandomhex(10);
    let uuid = create_uuid_via_namespace(randomhex + password);
    user = await db["users"].create({
      username,
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
      delete token?.myinfo?.password;
    }
    console.log("USER SIGNIN ::");
    console.log({
      user: user.id,
      username,
      password: user.password,
      uuid: user.uuid,
      active: user.active,
    });
    respok(res, "CREATED", null, { respdata: { ...token } });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    let { id, uuid } = req.decoded;
    if (!id || !uuid) {
      resperr(res, messages.ARG_MISSING);
      return;
    }
    console.log("USER LOGOUT ::");
    console.log({ id, uuid });
    await db["sessions"].update(
      { active: 0 },
      { where: { token: req.headers.authorization } }
    );
    respok(res, messages.LOGOUT);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
