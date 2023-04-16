import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import ts from "typescript";
import { changeExtension } from "./utils/changeExtension";
import {
  parseGqlTagImportIdentifiers,
  ParseGqlTagImportIdentifiersParams,
} from "./utils/parseGqlTagImportIdentifiers";
import { trimBackTicks } from "./utils/trimBackTicks";
import { unescapeBackTicks } from "./utils/unescapeBackTicks";

interface FileToMutate {
  filename: string;
  content: string;
}

interface ParsedOptions {
  targetExtension: string;
  gqlTagModules: string[];
  shouldRemoveOriginalUsage: boolean;
}

export const main = async (
  input: string[],
  options: ParsedOptions
): Promise<void> => {
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

  files.length
    ? console.log("🧐 Input files:")
    : console.log("🧐 No input files.");
  files.map((file) => console.log(file));
  console.log("");

  const filesToGenerate: FileToMutate[] = [];
  const filesToUpdate: FileToMutate[] = [];

  const program = ts.createProgram(files, { allowJs: false });

  files.forEach((file) => {
    const sourceFile = program.getSourceFile(file);

    if (!sourceFile) {
      throw new Error("Unable to get source file");
    }

    const targetFilename = changeExtension(file, options.targetExtension);
    const importIdentifiers: ParseGqlTagImportIdentifiersParams["importIdentifiers"] =
      {
        gqlTags: {},
        others: {},
      };

    const nodesToRemove: ts.Node[] = [];
    const graphqlTemplates: string[] = [];

    function handleExpression(node: ts.Node, expression: ts.Expression) {
      if (ts.isTaggedTemplateExpression(expression)) {
        const { tag, template } = expression;

        const tagIdentifier = tag.getText(sourceFile);
        // If tag is not part of gqlTags, do nothing
        if (!importIdentifiers.gqlTags[tagIdentifier]) {
          return;
        }

        if (ts.isNoSubstitutionTemplateLiteral(template)) {
          nodesToRemove.push(node);
          // If no subscription, use full template
          const tagTemplate = unescapeBackTicks(
            trimBackTicks(template.getText(sourceFile))
          );
          graphqlTemplates.push(tagTemplate);
        } else if (ts.isTemplateExpression(template)) {
          nodesToRemove.push(node);
          // If has subscription, ASSUME it's fragment. Replace usages and push template
          const convertedGraphqlImportLines: string[] = []; // ['#import "./a/b.graphql"','#import "./c/d.graphql"']
          const substitutionsToReplace: string[] = []; // ["${FRAGMENT_1}","${FRAGMENT_1}"]

          template.templateSpans.forEach((span) => {
            const identifier = span.expression.getText(sourceFile);
            if (importIdentifiers.others[identifier]) {
              convertedGraphqlImportLines.push(
                `#import "${importIdentifiers.others[identifier].moduleName}.graphql"`
              );
              substitutionsToReplace.push("${" + identifier + "}");
            }
          });

          const originalTagTemplate = unescapeBackTicks(
            trimBackTicks(template.getText(sourceFile))
          );
          const noSubstitutionTemplate = substitutionsToReplace.reduce(
            (result, substitution) => result.replace(substitution, ""),
            originalTagTemplate
          );
          graphqlTemplates.push(`${convertedGraphqlImportLines.join("\n")}
        ${noSubstitutionTemplate}`);
        }
      }
    }

    ts.forEachChild(sourceFile, (node: ts.Node) => {
      // Check imports for gqlTagIdentifiers
      if (ts.isImportDeclaration(node)) {
        parseGqlTagImportIdentifiers({
          node,
          source: sourceFile,
          gqlTagModules: options.gqlTagModules,
          importIdentifiers,
        });
      }

      if (ts.isExportAssignment(node)) {
        handleExpression(node, node.expression);
      } else if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach((declaration) => {
          if (declaration.initializer) {
            handleExpression(node, declaration.initializer);
          }
        });
      }
    });

    const fileContent = graphqlTemplates.join();

    if (fileContent) {
      filesToGenerate.push({
        filename: targetFilename,
        content: fileContent,
      });
    }

    // FIXME: assume only gql tags are imported on each import declaration.
    // This assumption means we can remove them all import declarations related to gql tags, even if they import something else.
    Object.values(importIdentifiers.gqlTags).forEach(
      ({ importDeclarationNode }) => nodesToRemove.push(importDeclarationNode)
    );

    if (options.shouldRemoveOriginalUsage && nodesToRemove.length > 0) {
      // Transformer to remove variable declaration nodes if matches nodesToRemove
      // How transformer work: https://github.com/madou/typescript-transformer-handbook
      const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        return (src) => {
          const visitor: ts.Visitor = (node) => {
            // If found a node that's at the same position as the a node to remove, assume
            // they are the same and remove them ( by returning undefined )
            if (
              nodesToRemove.find(
                (nodeToRemove) =>
                  nodeToRemove.pos === node.pos && nodeToRemove.end === node.end
              )
            ) {
              return undefined;
            }
            return ts.visitEachChild(node, visitor, context);
          };
          return ts.visitNode(src, visitor);
        };
      };

      const { transformed } = ts.transform(sourceFile, [transformer]);
      const newContent = ts
        .createPrinter({
          newLine: ts.NewLineKind.LineFeed,
          removeComments: false,
        })
        .printFile(transformed[0]);

      filesToUpdate.push({ content: newContent, filename: file });
    }
  });

  await Promise.all([
    ...filesToGenerate.map((file) => writeFile(file.filename, file.content)),
    ...filesToUpdate.map((file) => writeFile(file.filename, file.content)),
  ]);

  if (filesToGenerate.length > 0) {
    console.log("✨ Generated files:");
    filesToGenerate.forEach((file) => console.log(file.filename));
  } else {
    console.log("✨ No generated files.");
  }
  console.log("");

  if (filesToUpdate.length > 0) {
    console.log("✨ Updated files:");
    filesToUpdate.forEach((file) => console.log(file.filename));
  } else {
    console.log("✨ No updated files.");
  }
};
