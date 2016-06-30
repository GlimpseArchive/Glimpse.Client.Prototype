declare module 'querystring-browser' {
    export function parse(content: string): { [key: string]: string }; 
    export function stringify(obj: {}, sep?: string, eq?: string, options?: { encodeURIComponent: (str: string) => string }): string;
}
