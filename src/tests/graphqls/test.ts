import gql from "graphql-tag";

export const USER_DOCUMENT = gql`
  type Query {
    user: User
  }

  type User {
    id: ID!
    name: String!
  }
`;
