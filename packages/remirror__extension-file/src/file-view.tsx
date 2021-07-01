import React, { useEffect, useLayoutEffect, useState } from 'react';
import { NodeViewComponentProps } from '@remirror/react';

import type { FileAttributes } from './file-extension';

export const FileView: React.FC<NodeViewComponentProps> = (props) => {
  const attrs = props.node.attrs as unknown as FileAttributes;

  const [count, setCount] = useState(1);

  useLayoutEffect(() => {
    setCount((count) => count + 1);
  }, []);

  console.debug('FileView is rendering', count);

  return (
    <div
      style={{
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: 'lightgray',
      }}
    >
      {attrs.isUploading ? (
        <>
          <p>Uploading</p>
        </>
      ) : (
        <>
          <p>file name: {attrs.fileName}</p>
          <p>file type: {attrs.fileType}</p>
          <p>file size: {attrs.fileSize}</p>
        </>
      )}
    </div>
  );
};
