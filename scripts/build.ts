import Path from "path";
import Chalk from "chalk";
import FileSystem from "fs";
import * as Vite from "vite";
import compileTs from "./private/tsc.ts";
// ^ Extension can't be omitted because Node expects it
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

function buildRenderer() {
    return Vite.build({
        configFile: Path.join(__dirname, "..", "vite.config.ts"),
        base: "./",
        mode: "production",
    });
}

function buildMain() {
    const mainPath = Path.join(__dirname, "..", "src", "main");
    return compileTs(mainPath);
}

FileSystem.rmSync(Path.join(__dirname, "..", "build"), {
    recursive: true,
    force: true,
});

console.log(Chalk.blueBright("Transpiling renderer & main..."));

Promise.allSettled([buildRenderer(), buildMain()]).then(() => {
    console.log(
        Chalk.greenBright("Renderer & main successfully transpiled! (ready to be built with electron-builder)"),
    );
});
