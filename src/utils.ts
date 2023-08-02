import { mergeProps } from 'solid-js';
import { ENCLOSING_PAIRS, KEYS, isMacLike, isWindows } from './constants';

type DefaultAdded<Source extends object, Defaults extends Partial<Source>> = {
  [key in keyof (Source & Defaults)]: key extends keyof Source ? NonNullable<Source[key]> : never;
};

/**
 * Merges two objects maintaining reactivity.
 *
 * @param source The source object
 * @param defaults The default values
 * @returns The merged object
 */
export const mergeDefaults = <T extends object, const D extends Partial<T>>(
  source: T,
  defaults: D,
) => mergeProps(defaults, source) as DefaultAdded<T, D>;

/**
 * Given a set of string arguments, join the values together into a string with
 * spaces. Falsey values will be omitted,
 * e.g. classNames(['A', 'B', false, 'D', false]) --> 'A B D'
 * @param inputs The set of values
 * @returns The values joined as a string, or blank string if no values
 */
export const clsx = (...inputs: (string | boolean | undefined)[]) =>
  inputs.filter(Boolean).join(' ');
  
/**
 * Gets the specified lines from a multi-line text.
 * @param text The text from which the styles need to be extracted
 * @param position The end position
 * @returns The specified lines.
 */
export const getLines = (text: string, position: number) =>
  text.substring(0, position).split('\n');
  
/**
 * Checks if a character is one of the enclosing characters.
 * @param char The character to be tested
 * @returns whether the character is an enclosing character
 */
export const isEnclosingCharacter = (char: string): char is keyof typeof ENCLOSING_PAIRS => (char in ENCLOSING_PAIRS);

/**
 * Checks if a keyboard action is an undo action
 * @param event The keyboard event
 * @returns whether the key stroke corresponds to an undo action
 */
export const isUndo = (event: KeyboardEvent) => (
  (isMacLike
    // Undo in Mac will be command + z
    ? event.metaKey && event.key === KEYS.z
    // In all other platforms, it will be Ctrl + z
    : event.ctrlKey && event.key === KEYS.z
  ) &&
  !event.shiftKey &&
  !event.altKey
);

/**
 * Checks if a keyboard action is a redo action
 * @param event The keyboard event
 * @returns whether the key stroke corresponds to a redo action
 */
export const isRedo = (event: KeyboardEvent) => (
  (isMacLike
    // Redo in Mac will be command + shift + Z
    ? event.metaKey && event.shiftKey && event.key === KEYS.z
    : isWindows
      // In windows, it will be Ctrl + y
      ?  event.ctrlKey && event.key === KEYS.y && !event.shiftKey
      // In all other platforms, it will Ctrl + shift + y
      : event.ctrlKey && event.shiftKey && event.key === KEYS.z
  ) &&
  !event.altKey
);

/**
 * Checks if a keyboard action is a capture toggle action
 * @param event The keyboard event
 * @returns whether the key stroke corresponds to a capture toggle action
 */
export const isCaptureToggle = (event: KeyboardEvent) => (
  // Capture toggle action in Mac will be Ctrl + Shift + M
  // And in all other machines, it will be Ctrl + M
  (event.key === KEYS.m || event.key === KEYS.M) &&
  event.ctrlKey &&
  (isMacLike ? event.shiftKey : true)
);

/***************************
 * UNDO/REDO History setup *
 ***************************/
const HISTORY_LIMIT = 100;
const HISTORY_TIME_GAP = 3000;

export type Record = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type History = {
  stack: (Record & { timestamp: number })[];
  offset: number;
};

/**
 * Records a change in the history.
 * @param history The instance of the history being used
 * @param record The change record
 * @param overwrite Whether the record should overwrite the history
 */
export const recordChange = (history: History, record: Record, overwrite = false) => {  
  // Cleanup the current stack if it is not empty
  if (history.stack.length && history.offset > -1) {
    const { stack, offset } = history;
    // when something updates, drop the redo ops
    history.stack = stack.slice(0, offset + 1);
    
    // Limit the history to the HISTORY_LIMIT
    const count = history.stack.length;
    if (count > HISTORY_LIMIT) {
      const extras = count - HISTORY_LIMIT;
      history.stack = stack.slice(extras, count);
      history.offset = Math.max(history.offset - extras, 0);
    }
  }
  
  // current timestamp for the record
  const timestamp = Date.now();
  
  // if set to overwrite, overwrite the last entry
  if (overwrite) {
    const last = history.stack[history.offset];
    
    // check if a previous entry exists and was in short interval
    if (last && timestamp - last.timestamp < HISTORY_TIME_GAP) {
      // Match teh last word in the line
      const lastWordRegex = /[^a-z0-9]([a-z0-9]+)$/i;
      
      // Get the previous line
      const previous = getLines(last.value, last.selectionStart)
        .pop()
        ?.match(lastWordRegex);
      
      // Get the current line
      const current = getLines(record.value, record.selectionStart)
        .pop()
        ?.match(lastWordRegex);
        
      // If the last and the previous words match, then overwrite the
      // previous entry so that undo will remove the whole word
      if (previous?.[1] && current?.[1]?.startsWith(previous[1])) {
        history.stack[history.offset] = { ...record, timestamp };
        return;
      }
    }
  }
  
  // Add the new record to the stack
  history.stack.push({ ...record, timestamp });
  history.offset += 1;
};
