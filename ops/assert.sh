#!/bin/bash

set -eu

output_pattern=src/tests/**/*.graphql*

# Assert committed files are the same
echo "=> Checking if commited files matches generated sample..."
if [[ `git status --porcelain $output_pattern` ]]; then
  echo "x> Error!"
  echo "=> Following generated files does not have expected result:"
  git --no-pager diff HEAD --color -- $output_pattern
  echo "=> Run 'yarn dev', commit the changes and try again."
  exit 1
fi

echo "=> No errors."
exit 0