const fs = require("fs");
const path = require("path");
const { stdin, stdout } = require("node:process");

const txtPath = path.join(__dirname, "text.txt");
const stream = fs.createWriteStream(txtPath);

stdout.write("type your text: ");
stdin.on("data", (data) => {
  if (data.toString().trim() === "exit") {
    stdout.write("Goodbye!\n");
    process.exit();
  }
  stream.write(data);
});

process.on("SIGINT", () => {
  stdout.write("\nGoodbye!\n");
  process.exit();
});
