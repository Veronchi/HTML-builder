const fs = require("fs/promises");
const path = require("path");

async function copyDir() {
  const filesPath = path.join(__dirname, "/files");
  const filesCopyPath = path.join(__dirname, "/files-copy");
  await makeDirectory(filesCopyPath);
  await removeNonExistingFiles(filesCopyPath);
  await copyFiles(filesPath, filesCopyPath);
}

async function makeDirectory(filesCopyPath) {
  await fs.mkdir(filesCopyPath, { recursive: true });
}

async function removeNonExistingFiles(filesCopyPath) {
  const filesCopy = await fs.readdir(filesCopyPath);
  filesCopy.forEach(async (file) => {
    try {
      await fs.unlink(path.join(filesCopyPath, file));
    } catch (error) {
      console.log(error);
    }
  });
}

async function copyFiles(filesPath, filesCopyPath) {
  const files = await fs.readdir(filesPath);
  files.forEach(async (file) => {
    try {
      await fs.copyFile(
        path.join(filesPath, file),
        path.join(filesCopyPath, file)
      );
    } catch (error) {
      console.log(error);
    }
  });
}

copyDir();
