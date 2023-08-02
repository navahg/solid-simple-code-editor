import { Component, JSX, JSXElement, createMemo, onMount, splitProps } from 'solid-js';
import { ENCLOSING_PAIRS, KEYS, SHOW_PLACEHOLDER_STYLES, STYLES, TEXTAREA_CLASS } from './constants';
import { type History, type Record, clsx, mergeDefaults, recordChange, getLines, isEnclosingCharacter, isUndo, isRedo, isCaptureToggle } from './utils';

type Padding = JSX.CSSProperties['padding'] |
  Pick<JSX.CSSProperties,
    | 'padding-block'
    | 'padding-block-end'
    | 'padding-block-start'
    | 'padding-bottom'
    | 'padding-inline'
    | 'padding-inline-end'
    | 'padding-inline-start'
    | 'padding-left'
    | 'padding-right'
    | 'padding-top'
  >;

type PropsFromTextArea = 
  | 'autofocus'
  | 'disabled'
  | 'form'
  | 'maxLength'
  | 'minLength'
  | 'name'
  | 'onBlur'
  | 'onClick'
  | 'onFocus'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'placeholder'
  | 'readOnly'
  | 'required';
type PickedTextAreaProperties = Pick<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  PropsFromTextArea
>;
type PickedDivProperties = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style' | PropsFromTextArea>;

type Props = PickedDivProperties & PickedTextAreaProperties & {
  /**************************
   * Props of the component *
   **************************/

  /**
   * Callback which will receive text to highlight. You'll need to
   * return an HTML string or a React element with syntax highlighting
   * using a library such as prismjs.
   * @param value The value of the component
   * @returns The highlighted elements
   */
  highlight: (value: string) => JSXElement;

  /**
   * Whether the editor should ignore tab key presses so that keyboard
   * users can tab past the editor. Users can toggle this behavior using
   * Ctrl+Shift+M (Mac) / Ctrl+M manually when this is false.
   * @default false
   */
  ignoreTabKey?: boolean;

  /**
   * Whether to use spaces for indentation.
   * If you set it to false, you might also want to set tabSize to 1.
   * @default true
   */
  insertSpaces?: boolean;

  /**
   * Optional padding for code.
   * @default 0
   */
  padding?: Padding;

  /**
   * Custom styles for the component.
   */
  style?: JSX.CSSProperties;

  /**
   * The number of characters to insert when pressing tab key.
   * For example, for 4 space indentation, tabSize will be 4
   * and insertSpaces will be true.
   * @default 2
   */
  tabSize?: number;

  /**
   * Current value of the editor i.e. the code to display. This
   * must be a controlled prop.
   */
  value: string;

  /**
   * Callback which is called when the value of the editor changes.
   * You'll need to update the value prop when this is called.
   * @param value The updated value
   */
  onValueChange: (value: string) => void;

  /*****************************
   * Props related to textarea *
   *****************************/

  /**
   * The id for the underlying textarea element. This can be used for linking
   * the text area to a label or other accessibility related mapping.
   */
  textareaId?: string;

  /**
   * A class name for the underlying textarea element. Can be useful for more precise
   * control of its styles.
   */
  textareaClass?: string;

  /************************
   * Props related to pre *
   ************************/

  /**
   * A class name for the underlying pre element. Can be useful for more precise
   * control of its styles.
   */
  preClass?: string;
};

export const Editor: Component<Props> = (props) => {
  const fixedProps = mergeDefaults(props, {
    ignoreTabKey: false,
    insertSpaces: true,
    padding: 0,
    tabSize: 2,
  });
  const [local, rest] = splitProps(fixedProps, [
    // Component props
    'highlight',
    'ignoreTabKey',
    'insertSpaces',
    'padding',
    'style',
    'tabSize',
    'value',
    'onValueChange',

    // Custom textarea props
    'textareaId',
    'textareaClass',

    // Custom pre props
    'preClass',

    // Textarea native props
    'autofocus',
    'disabled',
    'form',
    'maxLength',
    'minLength',
    'name',
    'onBlur',
    'onClick',
    'onFocus',
    'onKeyDown',
    'onKeyUp',
    'placeholder',
    'readOnly',
    'required',
  ]);

  /**********************
   * Instance variables *
   **********************/
  let textareaElement: HTMLTextAreaElement | undefined;
  const history: History = {
    stack: [],
    offset: -1
  };
  let shouldCaptureTab = true;

  /***********************
   * Computed properties *
   ***********************/
  const contentStyle = createMemo<JSX.CSSProperties>(() => (
    typeof local.padding === 'object' ?
      local.padding :
      { padding: local.padding }
  ));
  const highlighted = createMemo(() => local.highlight(local.value));

  /******************
   * Helper methods *
   ******************/
  const updateInput = (record: Record) => {
    if (!textareaElement) return;
    
    // update value and selection state
    textareaElement.value = record.value;
    textareaElement.selectionStart = record.selectionStart;
    textareaElement.selectionEnd = record.selectionEnd;
    
    local.onValueChange(record.value);
  };
  
  const applyEdits = (record: Record) => {
    const last = history.stack[history.offset];
    if (last && textareaElement) {
      history.stack[history.offset] = {
        ...last,
        selectionEnd: textareaElement.selectionEnd,
        selectionStart: textareaElement.selectionStart,
      };
    }
    
    // save the changes
    recordChange(history, record);
    updateInput(record);
  };
  
  const undoEdit = () => {
    const prevRecord = history.stack[history.offset - 1];
    if (prevRecord) {
      updateInput(prevRecord);
      history.offset = Math.max(history.offset - 1, 0);
    }
  };
  
  const redoEdit = () => {
    const nextRecord = history.stack[history.offset + 1];
    if (nextRecord) {
      updateInput(nextRecord);
      history.offset = Math.min(history.offset + 1, history.stack.length - 1);
    }
  };

  /******************
   * Event handlers *
   ******************/
  const handleChange: JSX.ChangeEventHandler<HTMLTextAreaElement, Event> = (event) => {
    const { selectionEnd, selectionStart, value } = event.target;
    recordChange(
      history,
      {
        selectionEnd,
        selectionStart,
        value,
      },
      true,
    );
    local.onValueChange(value);
  };

  const handleKeyDown: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent> = (event) => {
    // call the handler if provider
    if (typeof local.onKeyDown === 'function') {
      local.onKeyDown(event);
      
      // if default prevented, return
      if (event.defaultPrevented) {
        return;
      }
    }
    
    // Blur on escape
    if (event.key === KEYS.ESCAPE) {
      event.currentTarget.blur();
    }
    
    const { selectionEnd, selectionStart, value } = event.currentTarget;
    const tabCharacter = (local.insertSpaces ? ' ' : '\t').repeat(local.tabSize);
    const hasSelection = selectionStart !== selectionEnd;
    
    if (event.key === KEYS.TAB && !local.ignoreTabKey && shouldCaptureTab) {
      // prevent focus change
      event.preventDefault();
      
      if (event.shiftKey) {
        // Unindent selected lines on shift + tab
        const linesBeforeCaret = getLines(value, selectionStart);
        const linesAfterCaret = getLines(value, selectionEnd);
        const startLine = linesBeforeCaret.length - 1;
        const endLine = linesAfterCaret.length - 1;
        const nextValue = value
          .split('\n')
          .map((line, index) => {
            // if able to shift left indentation, do that else
            // return the original line
            if (
              index >= startLine &&
              index <= endLine &&
              line.startsWith(tabCharacter)
            ) return line.substring(tabCharacter.length);
            return line;
          })
          .join('\n');
        
        // If the value has changed, apply the edits
        if (value !== nextValue) {
          const startLineText = linesBeforeCaret[startLine];
          applyEdits({
            value: nextValue,
            // Move the start cursor if first line in selection was modified
            // It was modified only if it started with a tab
            selectionStart: startLineText?.startsWith(tabCharacter)
              ? selectionStart - tabCharacter.length
              : selectionStart,
            // Move the cursor by total number of characters removed
            selectionEnd: selectionEnd - (value.length - nextValue.length),
          });
        }
      } else if (hasSelection) {
        // Indent on tab and only if there is a selection
        const linesBeforeCaret = getLines(value, selectionStart);
        const linesAfterCaret = getLines(value, selectionEnd);
        const startLine = linesBeforeCaret.length - 1;
        const endLine = linesAfterCaret.length - 1;
        const startLineText = linesBeforeCaret[startLine];

        applyEdits({
          value: value
            .split('\n')
            .map((line, index) => {
              if (index >= startLine && index <= endLine) return tabCharacter + line;
              return line;
            })
            .join('\n'),
          // Move the start cursor by number of characters added in first line of selection
          // Don't move it if it there was no text before cursor
          selectionStart:
            startLineText && /\S/.test(startLineText)
              ? selectionStart + tabCharacter.length
              : selectionStart,
          // Move the end cursor by total number of characters added
          selectionEnd:
            selectionEnd + tabCharacter.length * (endLine - startLine + 1),
        });
      } else {
        // If there is no selection, simply insert a tab at the caret position
        const updatedSelection = selectionStart + tabCharacter.length;
        applyEdits({
          // Insert tab character at caret
          value:
            value.substring(0, selectionStart) +
            tabCharacter +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      }
    } else if (event.key === KEYS.BACKSPACE) {
      // On Backspace remove all the tab characters before the caret
      const textBeforeCarat = value.substring(0, selectionStart);
      
      if (textBeforeCarat.endsWith(tabCharacter) && !hasSelection) {
        // prevent default behavior
        event.preventDefault();
        const updatedSelection = selectionStart - tabCharacter.length;
        
        applyEdits({
          // Remove tab character at caret
          value:
            value.substring(0, updatedSelection) +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      }
    } else if (event.key === KEYS.ENTER) {
      // On enter add indentation correctly and only when there
      // is no selection.
      if (!hasSelection) {
        // Get the current line
        const line = getLines(value, selectionStart).pop();
        // Check if the current line has any indentation
        const matches = line?.match(/^\s+/);

        if (matches?.[0]) {
          // prevent the default action
          event.preventDefault();

          // Preserve indentation on inserting a new line
          const indent = '\n' + matches[0];
          const updatedSelection = selectionStart + indent.length;

          applyEdits({
            // Insert indentation character at caret
            value:
              value.substring(0, selectionStart) +
              indent +
              value.substring(selectionEnd),
            // Update caret position
            selectionStart: updatedSelection,
            selectionEnd: updatedSelection,
          });
        }
      }
    } else if (isEnclosingCharacter(event.key)) {
      // if there is a selection, then enclose them in the characters
      if (hasSelection) {
        // prevent default
        event.preventDefault();
        
        const chars = ENCLOSING_PAIRS[event.key];
        applyEdits({
          value:
            value.substring(0, selectionStart) +
            chars[0] +
            value.substring(selectionStart, selectionEnd) +
            chars[1] +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart,
          selectionEnd: selectionEnd + 2,
        });
      }
    } else if (isUndo(event)) {
      event.preventDefault();
      undoEdit();
    } else if (isRedo(event)) {
      event.preventDefault();
      redoEdit();
    } else if (isCaptureToggle(event)) {
      event.preventDefault();
      shouldCaptureTab = !shouldCaptureTab;
    }
  };

  /*******************
   * Lifecycle hooks *
   *******************/

  onMount(() => {
    if (!textareaElement) return;
    recordChange(
      history,
      {
        selectionEnd: textareaElement.selectionEnd,
        selectionStart: textareaElement.selectionStart,
        value: textareaElement.value
      }
    );
  });

  return (
    <div {...rest} style={{ ...STYLES.CONTAINER, ...local.style }}>
      <textarea
        ref={textareaElement}
        autocapitalize="off"
        autocomplete="off"
        autofocus={local.autofocus}
        class={clsx(TEXTAREA_CLASS, local.textareaClass)}
        data-gramm={false}
        disabled={local.disabled}
        form={local.form}
        id={local.textareaId}
        maxLength={local.maxLength}
        minLength={local.minLength}
        name={local.name}
        onBlur={local.onBlur}
        onInput={handleChange}
        onClick={local.onClick}
        onFocus={local.onFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={local.onKeyUp}
        placeholder={local.placeholder}
        readOnly={local.readOnly}
        required={local.required}
        spellcheck={false}
        style={{ ...STYLES.EDITOR, ...STYLES.TEXTAREA, ...contentStyle() }}
        value={local.value}
      />
      <pre
        aria-hidden="true"
        class={local.preClass}
        style={{
          ...STYLES.EDITOR,
          ...STYLES.HIGHLIGHT,
          ...contentStyle()
        }}
        {...(
          typeof highlighted() === 'string' ?
            { innerHTML: `${highlighted()}<br/>` } :
            { children: highlighted() }
        )}
      />
      <style innerHTML={SHOW_PLACEHOLDER_STYLES} />
    </div>
  );
};

export default Editor;
