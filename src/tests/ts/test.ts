import gql3, { gql as ttt, gql } from "graphql-tag";
import React, { createElement } from "react";
import { gql as gql2 } from "graphql-tag";

export const TEST1 = gql3`
  query User {
    user(id: "420") {
      id
      name
    }
  }
`;

export const TEST2 = ttt`
  mutation UpdateUser {
    userUpdate(id: "420") {
      id
      name
    }
  }
`;

export const TEST3 = gql`
  query User {
    user(id: "500") {
      id
    }
  }
`;

export const TEST4 = gql2`
  query User {
    user(id: "501") {
      id
    }
  }
`;

export const TEST5 = createElement`
  query User {
    user(id: "501") {
      id
    }
  }
`;
