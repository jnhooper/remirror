import React, { useCallback, useLayoutEffect, useState } from 'react';
import { NodeViewComponentProps, useCommands } from '@remirror/react';

import type { FileAttributes } from './file-extension';

export const DefaultFileView: React.FC<NodeViewComponentProps> = (props) => {
  const attrs = props.node.attrs as unknown as FileAttributes;
  const getPosition = props.getPosition as () => number;

  // const [count, setCount] = useState(1);

  // useLayoutEffect(() => {
  //   setCount((count) => count + 1);
  // }, []);

  const { deleteFile } = useCommands();

  const onDelete = useCallback(() => {
    const pos = getPosition();
    deleteFile(pos);
  }, [deleteFile, getPosition]);

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
          <button onClick={onDelete}>delete</button>
        </>
      )}
    </div>
  );
};
