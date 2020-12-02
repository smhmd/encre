import {} from './index';
declare global {
  interface EncreElement {
    _in_encre?: true;
  }
  interface HTMLElement extends EncreElement {}
  interface Node extends EncreElement {}
}
