declare module 'url-parse' {
    function parseUrl(url: string, query?: boolean): {
        protocol: string;
        slashes: boolean;
        auth: string;
        username: string;
        password: string;
        host: string;
        hostname: string;
        port: number;
        pathname: string;
        query: string | { [key: string]: string };
        hash: string;
        href: string;
    };
    
    export = parseUrl;
}
