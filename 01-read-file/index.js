const fs = require("fs");
const path = require("path");
const { stdout } = require("node:process");

const txtPath = path.join(__dirname, "text.txt");

const stream = fs.createReadStream(txtPath, {
  encoding: "utf8",
});

stream.on("data", (chunck) => stdout.write(chunck));
stream.on("error", (error) => stdout.write(error.message));
