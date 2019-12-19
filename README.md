# Java imports search

Lets you easily search for all files using a Java package. Adds a new operator `java.imports:` for all import statements of the package passed to the operator.

NOTE: regular expression search mode is required for the `java.imports` keyword to work. The extension automatically appends `patternType:regexp` to queries containing `java.imports`.

This extension also adds a "See all usages" link at the end of import statement lines, which will execute the `java.imports` search for the relevant module. To enable "See all usages" links, add `"javaImports.showAllUsagesLinks": true` to your user settings.

## Prerequisites

Sourcegraph extensions are written in TypeScript and are distributed as bundled JavaScript files that run on the client. For creation, publishing, and viewing, you need:

- **Creation**: Install [Node.js](https://nodejs.org).
- **Publishing**: Install the [Sourcegraph CLI (`src`)](https://github.com/sourcegraph/src-cli#installation) and create a [Sourcegraph.com account](https://sourcegraph.com/sign-up).
- **Viewing**: Install the Sourcegraph extension for [Chrome](https://chrome.google.com/webstore/detail/sourcegraph/dgjhfomjieaadpoljlnidmbgkdffpack) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/sourcegraph/).

## Set up

```
npm install
```

## Lint and type check

```
npm run tslint
npm run typecheck
```

## Publish

```
src extensions publish
```

## Sourecgraph extension API

Visit the [Sourcegraph extension documentation](https://github.com/sourcegraph/sourcegraph-extension-docs) and check out some [Sourcegraph extension samples](https://github.com/sourcegraph/sourcegraph-extension-samples).
