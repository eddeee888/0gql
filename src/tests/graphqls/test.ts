import gql from "graphql-tag";

export const USER_DOCUMENT = gql`
  type Query {
    """
    Some comment about \`users\`
    """
    user: User @deprecated(reason: "Use \`users\` instead")
  }

  type User {
    id: ID!
    name: String!
  }
`;
