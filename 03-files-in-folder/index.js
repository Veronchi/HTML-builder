const fs = require("fs");
const path = require("path");
const { stdout } = require("node:process");

const secretPath = path.join(__dirname, "/secret-folder");

fs.readdir(secretPath, (err, files) => {
  if (err) {
    console.log(err.message);
  } else {
    files.forEach((file) => {
      fs.stat(path.join(secretPath, file), (err, stats) => {
        if (err) console.log(err.message);
        if (stats.isFile()) {
          let fileName = file.replace(/\.\w*$/gi, "");
          let size = stats.size / 1000;
          let result = `${fileName} - ${path.extname(file)} - ${size}kb\n`;
          stdout.write(result);
        }
      });
    });
  }
});
