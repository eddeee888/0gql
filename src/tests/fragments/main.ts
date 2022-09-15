import gql from "graphql-tag";
import { USER_FRAGMENT_1 } from "./fragment1";
import { USER_FRAGMENT_2 } from "./fragment2";

const USER_DOCUMENT = gql`
  ${USER_FRAGMENT_1}
  query User {
    user(id: "420") {
      id
      ...UserFragment1
      ...UserFragment2
    }
  }
  ${USER_FRAGMENT_2}
`;
