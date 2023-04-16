import gql from "graphql-tag";
import { gql as gql2 } from "@not/gql-tag";

export default gql`
  query User {
    user(id: "600") {
      id
    }
  }
`;

export const DO_NOT_REMOVE = true;
