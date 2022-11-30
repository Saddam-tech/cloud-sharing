const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const indexRouter = require("./routes/main");
const cors = require("cors");

app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  next();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

app.use("/", indexRouter);

module.exports = app;
