import gql from "graphql-tag";

export const USER_FRAGMENT_2 = gql`
  fragment UserFragment2 on User {
    id
    name
  }
`;
