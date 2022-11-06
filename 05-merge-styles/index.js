const fs = require("fs");
const path = require("path");

const stylesPath = path.join(__dirname, "/styles");
const bundle = path.join(__dirname, "project-dist", "bundle.css");
const streamW = fs.createWriteStream(bundle);

fs.readdir(stylesPath, (err, files) => {
  if (err) {
    console.log(err.message);
  } else {
    files.forEach((file) => {
      fs.stat(path.join(stylesPath, file), (err, stats) => {
        if (err) console.log(err.message);

        if (stats.isFile() && path.extname(file) === ".css") {
          const streamR = fs.createReadStream(path.join(stylesPath, file), {
            encoding: "utf8",
          });

          streamR.on("data", (chunck) => streamW.write(chunck));
        }
      });
    });
  }
});
