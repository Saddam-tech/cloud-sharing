const express = require("express");
const router = express.Router();
const fs = require("fs");
const shell = require("shelljs");
const { messages } = require("../utils/messages");
const _ = require("lodash");
const { resperr } = require("../utils/rest");

router.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    resperr(res, messages.ARG_MISSING);
    return;
  }
});

module.exports = router;
