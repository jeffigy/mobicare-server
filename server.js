const config = require("./src/utils/config");
const app = require("./src/app");

app.listen(config.PORT, () => {
  console.log(`server is running @ port ${config.PORT}`);
});
