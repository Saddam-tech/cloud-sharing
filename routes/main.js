const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Main Webpage");
  res.send("Welcome to the main page!!!");
});

module.exports = router;
