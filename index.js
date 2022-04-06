const server = require("./src/app.js");
const { conn } = require("./src/db.js");

conn.sync({ force: false }).then(() => {
  server.listen(process.env.PORT || 3000, () => {
    console.log(`listening on port 3000`);
  });
});
