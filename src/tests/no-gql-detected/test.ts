import gql from "graphql-tag";
import { gql as gql2 } from "@not/gql-tag";

export const TEST = gql2`
  query Test {
    car {
      id
      make
    }
  }
`;
