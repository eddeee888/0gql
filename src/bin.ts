#!/usr/bin/env node
import { program } from "commander";
import { glob } from "glob";
import { main } from "./main";

program
  .name("0gql")
  .version("0.0.1")
  .option(
    "-e, --extension <target extension>",
    "extension of the generated file/s",
    ".graphql"
  )
  .option(
    "-m, --modules <gql tag module/s>",
    "Module/s where gql tag could be imported from. Comma separated.",
    "graphql-tag"
  )
  .argument("<file pattern>")
  .action((filePattern, options) => {
    glob(filePattern, (globErr, files) => {
      if (globErr) {
        console.error(globErr);
        process.exit(1);
      }

      console.log(`"${filePattern}":`);
      files.map((file) => console.log(file));
      console.log("");

      main(files, {
        targetExtension: options.extension,
        gqlTagModules: options.modules.split(","),
      })
        .then((files) => {
          if (files.length > 0) {
            console.log("Generated files:");
            files.forEach((file) => console.log(file.filename));
          } else {
            console.log("No generated files.");
          }
          process.exit(0);
        })
        .catch((e) => {
          console.error(e);
          process.exit(1);
        });
    });
  });

program.parse(process.argv);
