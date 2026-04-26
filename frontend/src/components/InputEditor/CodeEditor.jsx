import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import tomorrowCSS from 'prismjs/themes/prism-tomorrow.css?raw';
import okaidiaCSS from 'prismjs/themes/prism-okaidia.css?raw';
import coyCSS from 'prismjs/themes/prism-coy.css?raw';
import solarizedlightCSS from 'prismjs/themes/prism-solarizedlight.css?raw';
import defaultCSS from 'prismjs/themes/prism.css?raw';

const THEME_OPTIONS = [
  { id: 'tomorrow', name: 'Tomorrow (Dark)' },
  { id: 'okaidia', name: 'Okaidia (Dark)' },
  { id: 'coy', name: 'Coy (Light)' },
  { id: 'solarizedlight', name: 'Solarized Light' },
  { id: 'default', name: 'Default (Light)' },
];

const THEME_BACKGROUNDS = {
  tomorrow: '#272822',
  okaidia: '#272822',
  coy: '#fff',
  solarizedlight: '#fdf6e3',
  default: '#f5f2f0',
};

const THEMES = {
  tomorrow: tomorrowCSS,
  okaidia: okaidiaCSS,
  coy: coyCSS,
  solarizedlight: solarizedlightCSS,
  default: defaultCSS,
};

function CodeEditor({ value, onChange, disabled, currentTheme = 'tomorrow' }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Remove any existing theme style
    const existing = document.getElementById('prism-theme-style');
    if (existing) existing.remove();

    // Add new theme style
    const css = THEMES[currentTheme] || THEMES.tomorrow;
    const style = document.createElement('style');
    style.id = 'prism-theme-style';
    style.textContent = css;
    document.head.appendChild(style);

    // Force re-render
    setKey((prev) => prev + 1);
  }, [currentTheme]);

  const backgroundColor = THEME_BACKGROUNDS[currentTheme] || THEME_BACKGROUNDS.tomorrow;

  return (
    <div className="h-full overflow-auto" style={{ backgroundColor }}>
      <Editor
        key={key}
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages.markup, 'markup')}
        disabled={disabled}
        padding={12}
        className="language-markup"
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          lineHeight: 1.5,
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}

export { CodeEditor, THEME_OPTIONS };
export default CodeEditor;
