import gql from "graphql-tag";

export const USER_FRAGMENT_1 = gql`
  fragment UserFragment1 on User {
    id
    age
  }
`;
