import ts from "typescript";
import { IdentifierMeta } from "../types";
import { trimQuotes } from "./trimQuotes";

/**
 * Function to parse an ImportDeclaration node,
 * returns an array of identifiers that might or might not be used as gql tag
 */
export const parseGqlTagImportIdentifiers = (
  node: ts.ImportDeclaration,
  source: ts.SourceFile
): Record<string, IdentifierMeta> => {
  const module = trimQuotes(node.moduleSpecifier.getText(source));

  // TODO: there are other modules to check. Maybe let users pass it in?
  const isGqlTagModule = module === "graphql-tag";

  const identifiers: Record<string, IdentifierMeta> = {};

  const defaultImportIdentifier = node.importClause?.name?.getText(source);
  if (defaultImportIdentifier) {
    identifiers[defaultImportIdentifier] = {
      isGqlTag: isGqlTagModule,
      isGqlTagModule,
      module,
    };
  }

  node.importClause?.namedBindings?.forEachChild((cn) => {
    if (ts.isImportSpecifier(cn)) {
      const isGqlTag =
        (!cn.propertyName && cn.name.getText(source) === "gql") ||
        cn.propertyName?.getText(source) === "gql";

      identifiers[cn.name.getText(source)] = {
        isGqlTag,
        isGqlTagModule,
        module,
      };
    }
  });

  return identifiers;
};
