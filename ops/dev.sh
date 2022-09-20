#!/bin/bash

set -eu

# Basic use cases
yarn ts-node ./src/bin.ts "src/tests/ts/*.ts"

# With .tsx
yarn ts-node ./src/bin.ts "src/tests/tsx/*.ts*"

# Fragment handling
yarn ts-node ./src/bin.ts "src/tests/fragments/*.ts"

# No gql tag usage
yarn ts-node ./src/bin.ts "src/tests/no-gql-detected/*.ts"

# Multiple gql tag module
yarn ts-node ./src/bin.ts "src/tests/multiple-gql-tag-modules/*.ts" --modules graphql-tag,@apollo/client

# Generated files to have different extension
yarn ts-node ./src/bin.ts "src/tests/graphqls/*.ts" --extension ".graphqls"

cp src/tests/remove-original-tag/test.before.ts src/tests/remove-original-tag/test.after.ts
yarn ts-node ./src/bin.ts "src/tests/remove-original-tag/test.after.ts" -r

yarn prettier -w src/tests
