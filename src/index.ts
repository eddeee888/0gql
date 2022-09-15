import { writeFile } from "fs/promises";
import path from "path";
import ts from "typescript";

const trimQuotes = (text: string): string => text.replace(/['"]+/g, "");
const trimBackTicks = (text: string): string => text.replace(/[`]+/g, "");

/**
 * Function to parse an ImportDeclaration node:
 *   - returns null if not targeted gql tag module
 *   - OR returns an array of possible identifiers that might be used as gql tag
 */
const parseGqlTagImportIdentifiers = (
  node: ts.ImportDeclaration,
  source: ts.SourceFile
): Record<string, true> | null => {
  const module = trimQuotes(node.moduleSpecifier.getText(source));

  // TODO: there are other modules to check. Maybe let users pass it in?
  if (module !== "graphql-tag") {
    return null;
  }

  const identifiers: Record<string, true> = {};

  const defaultImportIdentifier = node.importClause?.name?.getText(source);
  if (defaultImportIdentifier) {
    identifiers[defaultImportIdentifier] = true;
  }

  node.importClause?.namedBindings?.forEachChild((cn) => {
    if (ts.isImportSpecifier(cn)) {
      if (
        (!cn.propertyName && cn.name.getText(source) === "gql") ||
        cn.propertyName?.getText(source) === "gql"
      ) {
        identifiers[cn.name.getText(source)] = true;
      }
    }
  });

  return identifiers;
};

function changeExtension(file: string, extension: string) {
  const basename = path.basename(file, path.extname(file));
  return path.join(path.dirname(file), basename + extension);
}

const files = ["./src/tests/simple/test.ts"];
const targetFiles: { filename: string; content: string }[] = [];
const program = ts.createProgram(files, { allowJs: false });

files.forEach((file) => {
  const sourceFile = program.getSourceFile(file);

  if (!sourceFile) {
    throw new Error("Unable to get source file");
  }

  const targetFilename = changeExtension(file, ".graphql");
  let gqlTagIdentifiers: Record<string, true> = {};
  const graphqlTemplates: string[] = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    console.log("*** entering node:", ts.SyntaxKind[node.kind]);
    // Check imports for gqlTagIdentifiers
    if (ts.isImportDeclaration(node)) {
      const identifiers = parseGqlTagImportIdentifiers(node, sourceFile);
      if (identifiers) {
        gqlTagIdentifiers = { ...gqlTagIdentifiers, ...identifiers };
      }
    }

    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (
          declaration.initializer &&
          ts.isTaggedTemplateExpression(declaration.initializer)
        ) {
          const tagIdentifier = declaration.initializer.tag.getText(sourceFile);
          if (!gqlTagIdentifiers[tagIdentifier]) {
            return;
          }
          const tagTemplate = trimBackTicks(
            declaration.initializer.template.getText(sourceFile)
          );
          graphqlTemplates.push(tagTemplate);
        }
      });
    }
  });
  targetFiles.push({
    filename: targetFilename,
    content: graphqlTemplates.join(),
  });
});

(async () =>
  await Promise.all(
    targetFiles.map((file) => writeFile(file.filename, file.content))
  ))();
