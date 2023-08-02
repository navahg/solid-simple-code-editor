# solid-simple-code-editor

[![Build Status][build-badge]][build]
[![MIT License][license-badge]][license]
[![Version][version-badge]][package]
[![Bundle size (minified + gzip)][bundle-size-badge]][bundle-size]

> A port of [react-simple-code-editor](https://react-simple-code-editor.github.io/react-simple-code-editor/) written in [Solid JS](https://solidjs.com)

## Installation

```sh
npm install solid-simple-code-editor
```

or

```sh
yarn add solid-simple-code-editor
```

## Usage

You need to use the editor with a third party library which provides syntax highlighting. For example, it'll look like following with [`prismjs`](https://prismjs.com):

```tsx
import { createSignal } from 'solid-js';
import Editor from 'solid-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-jsx';

const code = `
function add(a, b) {
  return a + b;
}
`;

export const App = () => {
  const [code, setCode] = createSignal(code);
  
  return (
    <Editor
      value={code()}
      onValueChange={code => setCode(code)}
      highlight={code => highlight(code, languages.jsx, 'jsx')}
      padding="10px"
      style={{
        'font-family': '"Fira code", "Fira Mono", monospace',
        'font-size': 12,
      }}
    />
  );
}
```

Note that depending on your syntax highlighter, you might have to include additional CSS for syntax highlighting to work.

## Props

The editor accepts all the props accepted by the `textarea` element. In addition, the following props are also supported:

| Name      | Type  | Default |Description |
| ----------| ------- | --------- | --------- |
| highlight | (value: string) => JSXElement | &lt;REQUIRED&gt; | Callback which will receive text to highlight. You'll need to return an HTML string or a React element with syntax highlighting using a library such as prismjs.

<!-- badges -->

[build-badge]: https://img.shields.io/circleci/build/github/raghavan-renganathan/solid-simple-code-editor/main.svg?style=flat-square
[build]: https://circleci.com/gh/raghavan-renganathan/solid-simple-code-editor
[license-badge]: https://img.shields.io/npm/l/solid-simple-code-editor.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT
[version-badge]: https://img.shields.io/npm/v/solid-simple-code-editor.svg?style=flat-square
[package]: https://www.npmjs.com/package/solid-simple-code-editor
[bundle-size-badge]: https://img.shields.io/bundlephobia/minzip/solid-simple-code-editor.svg?style=flat-square
[bundle-size]: https://bundlephobia.com/result?p=solid-simple-code-editor
