import gql3, { gql as ttt, gql, other } from "graphql-tag";
import React, { createElement } from "react";
import { gql as gql2 } from "graphql-tag";

export const TEST1 = gql3`
  query User {
    user(id: "1") {
      id
      name
    }
  }
`;

export const TEST2 = ttt`
  mutation UpdateUser {
    userUpdate(id: "2") {
      id
      name
    }
  }
`;

export const TEST3 = gql`
  query User {
    user(id: "3") {
      id
    }
  }
`;

export const TEST4 = gql2`
  query User {
    user(id: "4") {
      id
    }
  }
`;

// Should not be in test.graphql because does not come from a gql module
export const TEST5 = createElement`
  query User {
    user(id: "5") {
      id
    }
  }
`;

// Should not be in test.graphql because not a gql function
export const TEST6 = other`
  query User {
    user(id: "6") {
      id
    }
  }
`;
