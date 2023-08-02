import dedent from 'dedent';
import { highlight, languages } from 'prismjs';
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { Editor } from '../../src';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markup';

import 'prismjs/themes/prism.min.css';
import './styles.css';

const defaultCode = dedent`
  import { render } from 'solid-js/web';
  
  function App() {
    return (
      <div>
        <h1>Hello world!</h1>
      </div>
    );
  }
  
  render(() => <App />, document.getElementById('root'));
`;

const App = () => {
  const [code, setCode] = createSignal(defaultCode);
  return (
    <main class="container">
      <div class="container__content">
        <h1>solid-simple-code-editor</h1>
        <p>A simple code editor with syntax highlighting written in Solid JS</p>
        <a  class="button" href="https://github.com/raghavan-renganathan/solid-simple-code-editor">
          Github
        </a>
        <div class="container__editor-container">
          <Editor
            placeholder="Enter your code"
            value={code()}
            onValueChange={(code) => setCode(code)}
            highlight={(code) => highlight(code, languages['jsx'], 'jsx')}
            padding="10px"
            class="container__editor"
          />
        </div>
      </div>
    </main>
  );
};

render(() => <App />, document.getElementById('app')!);
