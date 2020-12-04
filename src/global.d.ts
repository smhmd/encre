import {} from './index';
declare global {
  interface EncreElement {
    _in_encre?: true;
    _block_uid?: number;
  }
  interface HTMLElement extends EncreElement {}
  interface Node extends EncreElement {}
}
