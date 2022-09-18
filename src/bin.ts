import { program } from "commander";
import { glob } from "glob";
import { nogql } from "./nogql";

program
  .version("0.0.1")
  .argument("<file pattern>")
  .action((filePattern) => {
    glob(filePattern, (globErr, files) => {
      if (globErr) {
        console.error(globErr);
        process.exit(1);
      }

      console.log(`Files from "${filePattern}" pattern:`);
      files.map((file) => console.log(file));
      console.log("");

      nogql(files)
        .then((files) => {
          console.log("Generated files:");
          files.forEach((file) => console.log(file.filename));
          process.exit(0);
        })
        .catch((e) => {
          console.error(e);
          process.exit(1);
        });
    });
  });

program.parse(process.argv);
