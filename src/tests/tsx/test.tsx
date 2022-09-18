import gql from "graphql-tag";
import React from "react";

const USER_DOCUMENT = gql`
  query User {
    user(id: "420") {
      id
      name
    }
  }
`;

export const UserDisplay: React.FC = () => {
  return <div>User</div>;
};
