import prompts from "prompts";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import {
  writeFile,
  readFile,
} from "fs/promises";
import { exec } from "node:child_process";

function slugify(text) {
  // Remove accents and special characters
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Replace special characters with their non-special equivalents or remove them
  const specialCharsMap = {
    "æ": "ae", "œ": "oe", "ß": "ss", "ñ": "n",
    "ç": "c", "ø": "o", "å": "a", "ð": "d",
    "þ": "th"
  };
  text = text.replace(/[^a-zA-Z0-9\s-]/g, char => specialCharsMap[char] || "");
  return text.replace(/ /g, "-").toLowerCase();
}

const renamePackageJsonName = async (targetDir, projectName) => {
  const packageJsonPath = path.join(targetDir, "package.json");
  try {
    const packageJsonData = await readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonData);
    packageJson.name = projectName;
    await writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf8"
    );
  } catch (err) {
    console.log(err.message);
  }
};

(async () => {
  const projectNamePattern = /^[a-zA-Z0-9-]+$/;
  try{
    const response = await prompts([
      {
        type: "text",
        name: "projectName",
        message: "Enter your project name",
        initial: "my-project",
        format: (val) => slugify(val),
        validate: (val) =>
          projectNamePattern.test(val)
            ? true
            : "Project name should not contain special characters except hyphen (-)",
      },
    ]);
    const { projectName } = response;

    const targetDir = path.join(process.cwd(), projectName);
    const sourceDir = path.resolve(
      fileURLToPath(import.meta.url),
      "../../template"
    );

    if(!fs.existsSync(targetDir)){
      fs.mkdirSync(targetDir, { recursive: true });
      fs.cpSync(sourceDir, targetDir, { recursive: true });
      await renamePackageJsonName(targetDir, projectName);
      console.log(`Project created at ${targetDir}`);
      
      const installDependencies = await prompts([
        {
          type: "confirm",
          name: "installDependencies",
          message: "Do you want to install dependencies? [y/n]",
          initial: "yes",
          choices: ["yes", "no", "y", "n"],
        }
      ]);

      if(installDependencies.installDependencies){
        console.log("Installing dependencies...");
        const childProcess = exec(`cd ${targetDir} && npm install`, { stdio: "inherit" });
        childProcess.on("close", (code) => {
          console.log(`Dependencies installed with code ${code}`);
        });
      }

    } else {
      console.log(`Directory ${targetDir} already exists`);
    }
  }
  catch(err){
    console.log(err.message);
  }
})()