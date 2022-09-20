import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import ts from "typescript";
import type { IdentifierMeta } from "./types";
import { changeExtension } from "./utils/changeExtension";
import { parseGqlTagImportIdentifiers } from "./utils/parseGqlTagImportIdentifiers";
import { trimBackTicks } from "./utils/trimBackTicks";

interface GeneratedFile {
  filename: string;
  content: string;
}

interface ParsedOptions {
  targetExtension: string;
  gqlTagModules: string[];
}

export const main = async (
  input: string[],
  options: ParsedOptions
): Promise<GeneratedFile[]> => {
  const files = input.filter((fileOrFolder) => {
    if (fs.lstatSync(fileOrFolder).isDirectory()) {
      return false;
    }

    const acceptedExtensions = [".ts", ".tsx"];
    if (!acceptedExtensions.some((ext) => ext === path.extname(fileOrFolder))) {
      return false;
    }

    return true;
  });

  files.length ? console.log("Input files:") : console.log("No input files.");
  files.map((file) => console.log(file));
  console.log("");

  const targetFiles: GeneratedFile[] = [];
  const program = ts.createProgram(files, { allowJs: false });

  files.forEach((file) => {
    const sourceFile = program.getSourceFile(file);

    if (!sourceFile) {
      throw new Error("Unable to get source file");
    }

    const targetFilename = changeExtension(file, options.targetExtension);
    const indentifiers: {
      gqlTags: Record<string, IdentifierMeta>;
      others: Record<string, IdentifierMeta>;
    } = {
      gqlTags: {},
      others: {},
    };

    const graphqlTemplates: string[] = [];

    ts.forEachChild(sourceFile, (node: ts.Node) => {
      // Check imports for gqlTagIdentifiers
      if (ts.isImportDeclaration(node)) {
        const identifiers = parseGqlTagImportIdentifiers({
          node,
          source: sourceFile,
          gqlTagModules: options.gqlTagModules,
        });
        Object.entries(identifiers).forEach(([key, moduleMeta]) => {
          if (moduleMeta.isGqlTagModule) {
            indentifiers.gqlTags[key] = moduleMeta;
          } else {
            indentifiers.others[key] = moduleMeta;
          }
        });
      }

      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach((declaration) => {
          // If found a tagged template expression
          if (
            declaration.initializer &&
            ts.isTaggedTemplateExpression(declaration.initializer)
          ) {
            const { tag, template } = declaration.initializer;

            const tagIdentifier = tag.getText(sourceFile);
            // If tag is not part of gqlTags, do nothing
            if (!indentifiers.gqlTags[tagIdentifier]) {
              return;
            }

            if (ts.isNoSubstitutionTemplateLiteral(template)) {
              // If no subscription, use full template
              const tagTemplate = trimBackTicks(template.getText(sourceFile));
              graphqlTemplates.push(tagTemplate);
            } else if (ts.isTemplateExpression(template)) {
              // If has subscription, ASSUME it's fragment. Replace usages and push template
              const convertedGraphqlImportLines: string[] = []; // ['#import "./a/b.graphql"','#import "./c/d.graphql"']
              const substitutionsToReplace: string[] = []; // ["${FRAGMENT_1}","${FRAGMENT_1}"]

              template.templateSpans.forEach((span) => {
                const identifier = span.expression.getText(sourceFile);
                if (indentifiers.others[identifier]) {
                  convertedGraphqlImportLines.push(
                    `#import "${indentifiers.others[identifier].module}"`
                  );
                  substitutionsToReplace.push("${" + identifier + "}");
                }
              });

              const originalTagTemplate = trimBackTicks(
                template.getText(sourceFile)
              );
              const noSubstitutionTemplate = substitutionsToReplace.reduce(
                (result, substitution) => result.replace(substitution, ""),
                originalTagTemplate
              );
              graphqlTemplates.push(`${convertedGraphqlImportLines.join("\n")}
            ${noSubstitutionTemplate}`);
            }
          }
        });
      }
    });
    targetFiles.push({
      filename: targetFilename,
      content: graphqlTemplates.join(),
    });
  });

  await Promise.all(
    targetFiles.map((file) => writeFile(file.filename, file.content))
  );

  return targetFiles;
};
