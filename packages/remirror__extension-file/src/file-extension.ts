import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  extensionDecorator,
  ExtensionPriority,
  ExtensionTag,
  findChildren,
  getTextSelection,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  omitExtraAttributes,
  ProsemirrorNode,
  uniqueId,
} from '@remirror/core';
import { PasteRule } from '@remirror/pm/paste-rules';

import { FileView } from './file-view';

export interface FileAttributes {
  id?: string;
  isUploading: boolean;
  url?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

type UploadHandler = (file: File) => Promise<FileAttributes>;
type PasteHandler = (file: File) => FileAttributes;

export async function defaultUploadHandler(file: File): Promise<FileAttributes> {
  const src = URL.createObjectURL(file);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    isUploading: false,
    url: src,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}

export function defaultPasteHandler(file: File): FileAttributes {
  return {
    isUploading: true,
    url: undefined,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}

export interface FileOptions {
  uploadHandler?: UploadHandler;
  pasteHandler?: PasteHandler;
}

@extension<FileOptions>({
  defaultOptions: {
    uploadHandler: defaultUploadHandler,
    pasteHandler: defaultPasteHandler,
  },
})
export class FileExtension extends NodeExtension<FileOptions> {
  get name() {
    return 'file' as const;
  }

  ReactComponent = FileView;

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        isUploading: { default: false },
        url: { default: '' },
        fileName: { default: '' },
        fileType: { default: '' },
        fileSize: { default: '' },
      },
      ...override,
      selectable: true,
      draggable: false,
      atom: true,
      content: '',
      parseDOM: [
        {
          tag: '[data-attachment="1"]',
          priority: ExtensionPriority.High, // Higher priority than LinkExtension
          getAttrs: (dom) => {
            const anchor = dom as HTMLAnchorElement;
            const url = anchor.getAttribute('href');
            const fileName = anchor.getAttribute('data-filename');
            const fileType = anchor.getAttribute('data-filetype');
            const fileSize = anchor.getAttribute('data-filesize');

            return {
              ...extra.parse(dom),
              url,
              fileName,
              fileType,
              fileSize,
            };
          },
        },
      ],
      toDOM: (node) => {
        const { url, ...rest } = omitExtraAttributes(node.attrs, extra);
        const attrs = {
          ...extra.dom(node),
          ...rest,
          href: url,
          'data-attachment': '1',
          'data-filename': node.attrs.fileName,
          'data-filetype': node.attrs.fileType,
          'data-filesize': node.attrs.fileSize,
        };

        return ['a', attrs, url as string];
      },
    };
  }

  createPasteRules(): PasteRule[] {
    return [
      {
        type: 'file',
        fileHandler: (props) => {
          let pos: number | undefined;

          if (props.type === 'drop') {
            pos = props.pos;
          }

          return this.handlePaste(props.files, pos);
        },
      },
    ];
  }

  handlePaste(files: File[], pos: number | undefined): true {
    const nodes: ProsemirrorNode[] = [];

    for (const file of files) {
      const id = uniqueId();
      const attrs: FileAttributes = this.options.pasteHandler(file);
      const node = this.type.create({ ...attrs, id });

      this.store.chain.insertFile(node, pos);

      this.options.uploadHandler(file).then((attrs) => {
        const found = findChildren({
          node: this.store.view.state.doc,
          predicate: ({ node }) => {
            return node.attrs.id === id || node.type === this.type;
          },
          descend: false,
        })[0];

        if (found) {
          const { pos } = found;
          this.store.commands.updateFile(pos, attrs);
        }
      });

      nodes.push(node);
    }

    this.store.chain.run();
    return true;
  }

  // @command()
  // handleUpload(file: File) {
  //   return this.options.uploadHandler(file);
  // }

  @command()
  updateFile(pos: number, attrs: FileAttributes): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.setNodeMarkup(pos, undefined, attrs));
      return true;
    };
  }

  @command()
  insertFile(node: ProsemirrorNode, pos?: number): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(tr.selection, tr.doc);
      dispatch?.(tr.replaceRangeWith(pos ?? from, pos ?? to, node));
      return true;
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      file: FileExtension;
    }
  }
}
