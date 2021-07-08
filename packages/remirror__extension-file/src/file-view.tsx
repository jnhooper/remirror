import React, { useCallback, useLayoutEffect, useState } from 'react';
import { NodeViewComponentProps, useCommands } from '@remirror/react';

import type { FileAttributes } from './file-extension';

export const DefaultFileView: React.FC<NodeViewComponentProps> = ({ getPosition, node }) => {
  return <InnerDefaultFileView getPosition={getPosition} node={node} />;
};

export const InnerDefaultFileView: React.FC<Pick<NodeViewComponentProps, 'node' | 'getPosition'>> =
  (props) => {
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
            <p>file type: {formatFileType(attrs.fileType)}</p>
            <p>file size: {formatFileSize(attrs.fileSize ?? 0)}</p>
            <button onClick={onDelete}>delete</button>
          </>
        )}
      </div>
    );
  };

const formatFileType = (fileType: string | undefined) => {
  const extensionMap: { [key: string]: string } = {
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'vnd.ms-excel': 'xls',
  };

  if (!fileType) {
    return '';
  }

  const ext = fileType.split('/')[1] as string;
  return extensionMap[ext] ?? ext;
};

// Taken from: https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) {
    return '0';
  }

  const k = 1024,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))}\u00A0${sizes[i]}`;
};
