const morgan = require("morgan");

morgan.token("current-time", function () {
  return new Date().toLocaleTimeString();
});

morgan.token("req-body", (req, _res) => {
  if (
    process.env.NODE_ENV !== "test" &&
    process.env.NODE_ENV !== "production"
  ) {
    return JSON.stringify(req.body);
  }
  return "";
});

const morganMiddlware = morgan(
  ":current-time :method :url :status :res[content-length] - :response-time ms :req-body"
);

module.exports = morganMiddlware;
