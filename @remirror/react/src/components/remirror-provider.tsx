/** @jsx jsx */

import { jsx } from '@emotion/core';
import { ProviderProps, ReactElement } from 'react';

import { MakeOptional, Manager } from '@remirror/core';
import { oneChildOnly, RemirrorType } from '@remirror/react-utils';

import { defaultProps } from '../react-constants';
import { RemirrorContext } from '../react-contexts';
import { GetRootPropsConfig, InjectedRemirrorProps, RenderEditorProps } from '../react-types';
import { RenderEditor } from './render-editor';

export interface RemirrorContextProviderProps<ManagerType extends Manager = any>
  extends ProviderProps<InjectedRemirrorProps<ManagerType>> {
  /**
   * Sets the first child element as a the root (where the prosemirror editor
   * instance will be rendered).
   *
   * @remarks
   *
   * **Example with directly nested components**
   *
   * When using a remirror provider calling `getRootProps` is mandatory. By
   * setting `childAsRoot` to an object Remirror will inject these props into
   * the first child element.
   *
   * **Important** When using the child as root prop make sure to set the JSX
   * pragma as shown below.
   *
   * ```tsx
   * // @jsx jsx
   *
   * import { jsx } from '@emotion/core';
   * import { ManagedRemirrorProvider, RemirrorManager } from '@remirror/react';
   *
   * const Editor = () => {
   *   return (
   *     <RemirrorManager>
   *       <ManagedRemirrorProvider childAsRoot={{ refKey: 'ref' }}>
   *         <div />
   *       </ManagedRemirrorProvider>
   *     </RemirrorManager>
   *   );
   * }
   * ```
   *
   * If this is set to an empty object then the outer element must be able to
   * receive a default ref prop which will mount the editor to it. If left
   * undefined then the children components are responsible for calling
   * `getRootProps`.
   *
   * @defaultValue undefined
   */
  childAsRoot?: GetRootPropsConfig<string> | boolean;
}

export interface RemirrorProviderProps<ManagerType extends Manager = any>
  extends MakeOptional<Omit<RenderEditorProps<ManagerType>, 'children'>, keyof typeof defaultProps>,
    Pick<RemirrorContextProviderProps<ManagerType>, 'childAsRoot'> {
  /**
   * All providers must have ONE child element.
   */
  children: ReactElement;
}

/**
 * This purely exists so that we know when the remirror editor has been called
 * with a provider as opposed to directly as a render prop by the user.
 *
 * It's important because, when called directly by the user, `getRootProps` is
 * automatically called when the render prop is called. However, when called via
 * a Provider, the render prop renders the context component and it's not until
 * the element is actually rendered that the getRootProp in any nested
 * components is called.
 */
const RemirrorContextProvider = <ManagerType extends Manager = any>({
  childAsRoot: _,
  ...props
}: RemirrorContextProviderProps<ManagerType>) => {
  return <RemirrorContext.Provider {...props} />;
};

RemirrorContextProvider.$$remirrorType = RemirrorType.ContextProvider;
RemirrorContextProvider.defaultProps = {
  childAsRoot: false,
};

/**
 * The RemirrorProvider which injects context into it's child component.
 *
 * @remarks
 * This only supports one child. At the moment if that that child is a built in
 * html string element then it is also where the prosemirror editor will be
 * injected (root element).
 *
 * These can either be consumed using React Hooks
 * - `useRemirrorContext`
 * - `usePositioner`
 */
export const RemirrorProvider = <ManagerType extends Manager = any>({
  children,
  childAsRoot,
  ...props
}: RemirrorProviderProps<ManagerType>) => {
  return (
    <RenderEditor {...props}>
      {(value) => {
        return (
          <RemirrorContextProvider value={value} childAsRoot={childAsRoot}>
            {oneChildOnly(children)}
          </RemirrorContextProvider>
        );
      }}
    </RenderEditor>
  );
};

RemirrorProvider.$$remirrorType = RemirrorType.EditorProvider;

export interface ManagedRemirrorProviderProps<ManagerType extends Manager = any>
  extends Omit<RemirrorProviderProps<ManagerType>, 'manager'> {}
