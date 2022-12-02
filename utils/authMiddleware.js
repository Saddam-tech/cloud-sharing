const jwt = require("jsonwebtoken");
const db = require("../models");
require("dotenv").config({ path: "../.env" });
const LOGGER = console.log;
exports.auth = (req, res, next) => {
  LOGGER(req.headers.authorization);
  try {
    jwt.verify(
      `${req.headers.authorization}`,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          throw err;
        }
        req.decoded = decoded;
        return next();
      }
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      //			LOGGER( `TokenExpiredError`) ; return next()
      return res.status(419).json({
        code: 419,
        message: "Token Expired.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      //		LOGGER( `JsonWebTokenError`) ; return next()
      return res.status(401).json({
        code: 401,
        message: "Token Invalid.",
      });
    }
  }
};

exports.softauth = (req, res, next) => {
  try {
    let result = jwt.verify(
      `${req.headers.authorization}`,
      process.env.JWT_SECRET,
      (err, decoded) => {
        // console.log('softauth@@@@@@@@@@@@ decoded', decoded);

        req.decoded = decoded;
        return next();
      }
    );
  } catch (error) {
    req.decoded = false;
    return next();
  }
};

exports.adminauth = async (req, res, next) => {
  let { id } = jwt.verify(
    `${req.headers.authorization}`,
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(401).json({
          code: 401,
          message: "No Admin Privileges",
        });
      }
      req.decoded = decoded;
      return decoded;
    }
  );
  if (!id) {
    return;
  } else {
  }
  let user = await db["users"].findOne({ where: { id }, raw: true });
  if (user.isadmin === 0) {
    return res.status(401).json({
      code: 401,
      message: "No Admin Privileges",
    });
  }
  req.isadmin = user.isadmin;
  if (user.isadmin === 1) {
    req.admin_level = "GENERAL";
  }
  if (user.isadmin === 3) {
    req.admin_level = "EXCLUSIVE";
  }
  if (user.isadmin === 2) {
    req.admin_level = "ADMIN";
  }

  return next();
};
