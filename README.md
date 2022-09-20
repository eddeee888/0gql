# 0gql

Codemod tool to detect gql tag templates and extract them to separate files

## Usage

By default, this codemod finds all `gql` tag usage from `graphql-tag` imports of a given pattern. Then, it analyses and puts GraphQL content and fragments into a separate `.graphql` file.

```bash
# This codemods all .ts and .tsx files under path/to/files that import and use gql tag
$ npx 0gql "path/to/files/*.ts*"
```

There are other options as well. Check the full options in the [Options](#options) section.

## Options

```
Usage: 0gql [options] <file pattern>

Options:
  -V, --version                       output the version number
  -e, --extension <target extension>  extension of the generated file/s (default: ".graphql")
  -m, --modules <gql tag module/s>    Module/s where gql tag could be imported from. Comma separated. (default: "graphql-tag")
  -h, --help                          display help for command
```
