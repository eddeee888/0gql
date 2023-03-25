import gql from "graphql-tag";
import { gql as gql2 } from "@not/gql-tag";

export const TEST = gql`
  query User {
    user(id: "500") {
      id
    }
  }
`;

export const DO_NOT_REMOVE = true;
