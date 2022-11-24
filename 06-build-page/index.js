const fs = require("fs");
const path = require("path");
const { start } = require("repl");

const projectDistPath = path.join(__dirname, "project-dist");
fs.mkdir(projectDistPath, { recursive: true }, (err) => {
  if (err) throw err;
});

async function initial() {
  const template = await getKeys();
  const components = await getComponents(template.keys);
  createHTMLBundle(template, components);
  createCSSBundle();
  copyFolder(path.join(__dirname, "assets"));
}
initial();

function getKeys() {
  return new Promise((res, rej) => {
    let result = {};

    const templatePath = path.join(__dirname, "template.html");
    const templateStream = fs.createReadStream(templatePath, {
      encoding: "utf8",
    });

    templateStream.on("data", (chunk) => {
      const parts = chunk
        .match(/{{(\w+)}}/gm)
        .map((item) => item.match(/\w+/gm)[0]);

      result.data = chunk;
      result.keys = parts;
    });

    templateStream.on("close", () => res(result));
  });
}

function getComponents(keys) {
  return new Promise((res, rej) => {
    const componentsPath = path.join(__dirname, "components");
    fs.readdir(componentsPath, (err, files) => {
      if (err) console.log(err.message);
      const arr = files.map((file) => getComponent(keys, file));
      Promise.all(arr).then((data) => {
        const result = data.reduce((acc, item) => {
          return { ...acc, ...item };
        }, {});
        res(result);
      });
    });
  });
}

function getComponent(keys, file) {
  return new Promise((res, rej) => {
    let result = {};
    let fileName = file.replace(/\.\w*$/gi, "");
    if (keys.includes(fileName)) {
      const componentsPath = path.join(__dirname, "components", file);
      const componentsStream = fs.createReadStream(componentsPath, {
        encoding: "utf8",
      });
      componentsStream.on("data", (chunk) => {
        if (result[fileName]) result[fileName] += chunk;
        else result[fileName] = chunk;
      });

      componentsStream.on("close", () => res(result));
    }
  });
}

function createHTMLBundle(template, components) {
  const templateBundlePath = path.join(projectDistPath, "index.html");
  let templateBundle = fs.createWriteStream(templateBundlePath);
  const res = template.data.replace(/{{(\w+)}}/gm, (string) => {
    return components[string.match(/\w+/gm)[0]];
  });
  templateBundle.write(res);
}

function createCSSBundle() {
  const stylesPath = path.join(__dirname, "styles");
  const stylesBundlePath = path.join(projectDistPath, "style.css");
  const stylesBundle = fs.createWriteStream(stylesBundlePath);

  fs.readdir(stylesPath, (err, files) => {
    if (err) {
      console.log(err.message);
    } else {
      files.forEach((file) => {
        fs.stat(path.join(stylesPath, file), (err, stats) => {
          if (err) console.log(err.message);

          if (stats.isFile() && path.extname(file) === ".css") {
            const stylesStream = fs.createReadStream(
              path.join(stylesPath, file),
              {
                encoding: "utf8",
              }
            );

            stylesStream.on("data", (chunck) =>
              stylesBundle.write(chunck + "\n")
            );
          }
        });
      });
    }
  });
}

function copyFolder(originPath) {
  makeDirectory(originPath);
  removeNonExistingFiles(originPath);

  fs.readdir(originPath, (err, files) => {
    files.forEach((file) => {
      const filePath = path.join(originPath, file);
      fs.stat(filePath, (err, stats) => {
        if (!stats.isFile()) copyFolder(filePath);
        else {
          copyFiles(filePath);
        }
      });
    });
  });
}

function makeDirectory(folderPath) {
  const relativePath = folderPath.replace(__dirname, "");
  fs.mkdir(
    path.join(__dirname, "project-dist", relativePath),
    { recursive: true },
    (err) => {
      if (err) throw err;
    }
  );
}

function removeNonExistingFiles(folderPath) {
  const relativePath = folderPath.replace(__dirname, "");
  const newPath = path.join(__dirname, "project-dist", relativePath);
  fs.access(newPath, (err) => {
    try {
      if (err) throw err;

      fs.readdir(newPath, (err, files) => {
        if (err) throw err;

        files.forEach((file) => {
          fs.unlink(path.join(newPath, file), (err) => {});
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  });
}

function copyFiles(folderPath) {
  const relativePath = folderPath.replace(__dirname, "");
  const newPath = path.join(__dirname, "project-dist", relativePath);
  fs.copyFile(folderPath, newPath, (err) => {});
}
