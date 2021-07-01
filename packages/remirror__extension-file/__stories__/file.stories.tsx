import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

import { FileExtension } from '../src/file-extension';

export default { title: 'File extension' };

export const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoRender>
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};

const extensions = () => [new FileExtension({})];

const content = `<p>Above!</p>`;
