import {} from './index';
declare global {
  interface EncreElement {
    _uid?: number;
    _is_abstract_node?: boolean;
  }
  interface HTMLElement extends EncreElement {}
  interface Node extends EncreElement {}
}
