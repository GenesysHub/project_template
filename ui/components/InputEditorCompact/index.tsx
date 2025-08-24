'use client';

import { useState } from 'react';
import { observer } from '@legendapp/state/react';
import { Editor } from '@monaco-editor/react';
import { ActionIcon, Card, Group, Select } from '@mantine/core';
import { observable } from '@legendapp/state';
import { IconChevronsRight, IconCode } from '@tabler/icons-react';

import { calculateEditorHeight } from '@genesyshub/core/core/utils';

export function replacer(key: string, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.$$typeof === Symbol.for('react.element')) {
      return { 'react.element': `${value?.$$typeof.toString()}` };
    }
  }
  return value;
}

const getEditorValue = (value: string) => {
  return typeof value === 'string'
    ? value
    : JSON.stringify(value, (key, val) => (typeof val === 'bigint' ? val.toString() : val), 2);
};
const InputEditor = observer(
  ({
    data,
    onChange,
    editable,
    language,
    h,
    w,
    suggestions,
  }: {
    data: any;
    onChange?: (value: string) => void;
    editable?: boolean;
    language?: string;
    h?: number;
    w?: number;
    suggestions?: any[];
  }) => {
    const value = observable(data);
    const editorValue = getEditorValue(value.get());

    const autoH = calculateEditorHeight(value.get());
    const autoW = 'auto';

    const [custom_language, setLanguage] = useState(language || 'javascript');
    const [showSelect, setShowSelect] = useState(false);

    return (
      <div style={{ position: 'relative' }}>
        <Editor
          beforeMount={(monaco) => handleEditorWillMount(monaco, suggestions)}
          onMount={handleEditorDidMount}
          height={h || autoH}
          width={w || autoW}
          language={custom_language}
          value={editorValue}
          onChange={(newValue: any) => {
            editable && value.set(language === 'json' ? JSON.parse(newValue) : newValue);
            onChange && onChange(newValue);
          }}
          theme="myTheme"
          options={{
            wordWrap: 'on',
            //scroll: false,
            minimap: { enabled: false },
            showUnused: false,
            folding: true,
            lineNumbersMinChars: 3,
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
        <Card bg={'dark.8'} p={0} pos="absolute" style={{ top: 0, right: 10, zIndex: 100 }}>
          {showSelect ? (
            <Group gap={4} justify="right">
              <ActionIcon
                variant={'transparent'}
                color="gray"
                onClick={() => setShowSelect(!showSelect)}
                style={{ zIndex: 101 }}
              >
                <IconChevronsRight size="1rem" stroke={1} />
              </ActionIcon>
              <Select
                variant="filled"
                style={{ zIndex: 101 }}
                size="xs"
                w={100}
                value={custom_language}
                data={monaco$.languages.get()}
                searchable
                onChange={(e: any) => setLanguage(e || 'javascript')}
              />
            </Group>
          ) : (
            <ActionIcon
              variant={'transparent'}
              color="gray"
              onClick={() => setShowSelect(!showSelect)}
              style={{ zIndex: 101 }}
            >
              <IconCode size="1rem" stroke={1} />
            </ActionIcon>
          )}
        </Card>
      </div>
    );
  },
);

export default InputEditor;

const jsonataLanguage = {
  tokenizer: {
    root: [
      [/\$[a-zA-Z_]\w*/, 'variable'],
      [/[{}[\]]/, '@brackets'],
      [/[,:]/, 'delimiter'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string'],
      [/\d+/, 'number'],
      [/[a-zA-Z_]\w*/, 'identifier'],
    ],
    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop'],
    ],
  },
};

const monaco$ = observable<any>({
  languages: [
    'plaintext',
    'abap',
    'apex',
    'azcli',
    'bat',
    'bicep',
    'cameligo',
    'clojure',
    'coffeescript',
    'c',
    'cpp',
    'csharp',
    'csp',
    'css',
    'cypher',
    'dart',
    'dockerfile',
    'ecl',
    'elixir',
    'flow9',
    'fsharp',
    'freemarker2',
    'freemarker2.tag-angle.interpolation-dollar',
    'freemarker2.tag-bracket.interpolation-dollar',
    'freemarker2.tag-angle.interpolation-bracket',
    'freemarker2.tag-bracket.interpolation-bracket',
    'freemarker2.tag-auto.interpolation-dollar',
    'freemarker2.tag-auto.interpolation-bracket',
    'go',
    'graphql',
    'handlebars',
    'hcl',
    'html',
    'ini',
    'java',
    'javascript',
    'julia',
    'kotlin',
    'less',
    'lexon',
    'lua',
    'liquid',
    'm3',
    'markdown',
    'mdx',
    'mips',
    'msdax',
    'mysql',
    'objective-c',
    'pascal',
    'pascaligo',
    'perl',
    'pgsql',
    'php',
    'pla',
    'postiats',
    'powerquery',
    'powershell',
    'proto',
    'pug',
    'python',
    'qsharp',
    'r',
    'razor',
    'redis',
    'redshift',
    'restructuredtext',
    'ruby',
    'rust',
    'sb',
    'scala',
    'scheme',
    'scss',
    'shell',
    'sol',
    'aes',
    'sparql',
    'sql',
    'st',
    'swift',
    'systemverilog',
    'verilog',
    'tcl',
    'twig',
    'typescript',
    'vb',
    'wgsl',
    'xml',
    'yaml',
    'json',
  ],
});

function handleEditorWillMount(monaco: any, suggestions?: any) {
  monaco.editor.defineTheme(
    'myTheme',
    {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0E0E0E00',
      },
    },
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({}),
  );
}

function handleEditorDidMount(monaco: any) {
  monaco.languages?.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
}
