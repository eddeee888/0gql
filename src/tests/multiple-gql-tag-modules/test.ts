import gql from "graphql-tag";
import { gql as gql2 } from "@not/gql-tag";
import { gql as gql3 } from "@apollo/client";

export const TEST_1 = gql`
  query Test1 {
    car {
      id
      make
    }
  }
`;

export const TEST_2 = gql2`
  query Test2 {
    car {
      id
      make
    }
  }
`;

export const TEST_3 = gql3`
  mutation Test3 {
    deleteThing(id: "420") {
      id
      deletedAt
    }
  }
`;
