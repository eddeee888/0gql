import { gql } from "@not/gql-tag";

export const TEST = gql`
  query Test {
    car {
      id
      make
    }
  }
`;
