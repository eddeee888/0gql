import ts from "typescript";
import { trimQuotes } from "./trimQuotes";

interface ImportIdentifierMeta {
  moduleName: string;
  importDeclarationNode: ts.ImportDeclaration;
}

export interface ParseGqlTagImportIdentifiersParams {
  node: ts.ImportDeclaration;
  source: ts.SourceFile;
  gqlTagModules: string[];
  importIdentifiers: {
    gqlTags: Record<string, ImportIdentifierMeta>;
    others: Record<string, ImportIdentifierMeta>; // `others` are used to keep track of non-gqlTag imports which could potentially be fragments
  };
}

/**
 * Function to parse an ImportDeclaration node,
 * returns an array of identifiers that might or might not be used as gql tag
 */
export const parseGqlTagImportIdentifiers = ({
  node,
  source,
  gqlTagModules,
  importIdentifiers,
}: ParseGqlTagImportIdentifiersParams): void => {
  const moduleName = trimQuotes(node.moduleSpecifier.getText(source));

  const isGqlTagModule = gqlTagModules.includes(moduleName);

  const defaultImportIdentifier = node.importClause?.name?.getText(source);
  if (defaultImportIdentifier) {
    const key: keyof ParseGqlTagImportIdentifiersParams["importIdentifiers"] =
      isGqlTagModule ? "gqlTags" : "others";
    importIdentifiers[key][defaultImportIdentifier] = {
      moduleName,
      importDeclarationNode: node,
    };
  }

  node.importClause?.namedBindings?.forEachChild((cn) => {
    if (ts.isImportSpecifier(cn)) {
      const isGqlTag =
        (!cn.propertyName && cn.name.getText(source) === "gql") ||
        cn.propertyName?.getText(source) === "gql";

      const key: keyof ParseGqlTagImportIdentifiersParams["importIdentifiers"] =
        isGqlTag && isGqlTagModule ? "gqlTags" : "others";

      importIdentifiers[key][cn.name.getText(source)] = {
        moduleName,
        importDeclarationNode: node,
      };
    }
  });
};
