import {} from './index';
declare global {
  interface Node extends Record<string, any> {
    _uid?: number;
  }
}
