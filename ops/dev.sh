#!/bin/bash

set -eu

yarn ts-node ./src/bin.ts "src/tests/ts/*.ts"
yarn ts-node ./src/bin.ts "src/tests/tsx/*.ts*"
yarn ts-node ./src/bin.ts "src/tests/fragments/*.ts"
yarn ts-node ./src/bin.ts "src/tests/graphqls/*.ts" --extension ".graphqls"
yarn prettier -w src/tests
