import gql3, { gql as ttt, gql } from "graphql-tag";
import React, { createElement } from "react";
import { gql as gql2 } from "graphql-tag";

export const USER_DOCUMENT = gql`
  query User {
    user(id: "420") {
      id
      name
    }
  }
`;

export const UPDATE_USER_DOCUMENT = gql`
  mutation UpdateUser {
    userUpdate(id: "420") {
      id
      name
    }
  }
`;
