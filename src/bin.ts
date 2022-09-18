import { program } from "commander";
import { nogql } from "./nogql";

program
  .version("0.0.1")
  .argument("<file pattern>")
  .action((filePattern) => {
    console.log(filePattern);

    const files = [
      "src/tests/simple/test.ts",
      "./src/tests/fragments/main.ts",
      "src/tests/fragments/fragment1.ts",
      "src/tests/fragments/fragment2.ts",
    ];

    nogql(files);
  });

program.parse(process.argv);
