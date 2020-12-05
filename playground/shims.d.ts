declare module '*.vue' {}
declare module 'prismjs/prism.js' {
  const languages = {
    json: '',
  };
  declare function highlight(...args: any): string;
}
