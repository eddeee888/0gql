import ts from "typescript";

const file = "src/tests/test.ts";

const program = ts.createProgram([file], { allowJs: true });
const sourceFile = program.getSourceFile(file);

if (!sourceFile) {
  throw new Error("Unable to get source file");
}

const trimQuotes = (text: string): string => text.replace(/['"]+/g, "");

/**
 * Function to parse an ImportDeclaration node:
 *   - returns null if not targeted gql tag module
 *   - OR returns an array of possible identifiers that might be used as gql tag
 */
const parseGqlTagImportIdentifiers = (
  node: ts.ImportDeclaration,
  source: ts.SourceFile
): string[] | null => {
  const module = trimQuotes(node.moduleSpecifier.getText(source));

  // TODO: there are other modules to check. Maybe let users pass it in?
  if (module !== "graphql-tag") {
    return null;
  }

  const identifiers: string[] = [];

  const defaultImportIdentifier = node.importClause?.name?.getText(source);
  if (defaultImportIdentifier) {
    identifiers.push(defaultImportIdentifier);
  }

  node.importClause?.namedBindings?.forEachChild((cn) => {
    if (ts.isImportSpecifier(cn)) {
      if (
        (!cn.propertyName && cn.name.getText(source) === "gql") ||
        cn.propertyName?.getText(source) === "gql"
      ) {
        identifiers.push(cn.name.getText(source));
      }
    }
  });

  return identifiers;
};

let gqlTagIdentifiers: string[] = [];

ts.forEachChild(sourceFile, (node: ts.Node) => {
  console.log("*** entering node:", ts.SyntaxKind[node.kind]);
  // Check imports for gqlTagIdentifiers
  if (ts.isImportDeclaration(node)) {
    const identifiers = parseGqlTagImportIdentifiers(node, sourceFile);
    if (identifiers) {
      gqlTagIdentifiers = [...gqlTagIdentifiers, ...identifiers];
    }
  }

  if (ts.isVariableStatement(node)) {
    console.log("=> Variable:", node);
  }
});
