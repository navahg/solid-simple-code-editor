import { JSX } from 'solid-js/jsx-runtime';

export const KEYS = {
  BACKSPACE: 'Backspace',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  m: 'm',
  M: 'M',
  TAB: 'Tab',
  y: 'y',
  z: 'z',
} as const;

export const ENCLOSING_PAIRS = {
  '(': ['(', ')'],
  '[': ['[', ']'],
  '{': ['{', '}'],
  '\'': ['\'', '\''],
  '"': ['"', '"'],
  '`': ['`', '`'],
};

const userAgent = window?.navigator?.userAgent ?? '';

export const isWindows = /win/i.test(userAgent);
export const isMacLike = /(mac|iphone|ipad|ipod)/i.test(userAgent);

export const TEXTAREA_CLASS = 'npm__solid-simple-code-editor__textarea';

export const SHOW_PLACEHOLDER_STYLES = /* CSS */ `
/**
 * Reset the text fill color to make placeholder visible when there
 * is no text
 */
.${TEXTAREA_CLASS}:placeholder-shown {
  -webkit-text-fill-color: inherit !important;
}
`;

export const STYLES: Readonly<Record<'CONTAINER' | 'TEXTAREA' | 'HIGHLIGHT' | 'EDITOR', JSX.CSSProperties>> = {
  CONTAINER: {
    'box-sizing': 'border-box',
    'text-align': 'left',
    overflow: 'hidden',
    padding: 0,
    position: 'relative',
  },
  TEXTAREA: {
    '-moz-osx-font-smoothing': 'grayscale',
    '-webkit-font-smoothing': 'antialiased',
    '-webkit-text-fill-color': 'transparent',
    color: 'inherit',
    height: '100%',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    resize: 'none',
    top: 0,
    width: '100%',
  },
  HIGHLIGHT: {
    'pointer-events': 'none',
    position: 'relative',
  },
  EDITOR: {
    'box-sizing': 'inherit',
    'font-family': 'inherit',
    'font-size': 'inherit',
    'font-style': 'inherit',
    'font-variant-ligatures': 'inherit',
    'font-weight': 'inherit',
    'letter-spacing': 'inherit',
    'line-height': 'inherit',
    'overflow-wrap': 'break-word',
    'tab-size': 'inherit',
    'text-indent': 'inherit',
    'text-rendering': 'inherit',
    'text-transform': 'inherit',
    'white-space': 'pre-wrap',
    'word-break': 'keep-all',
    background: 'none',
    border: 0,
    display: 'inherit',
    margin: 0,
  },
};
