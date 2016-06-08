export const WebRequestType = 'web-request';

export interface IWebRequestPayload {
    protocol: {
        identifier: string;
        version: string;
    };
    url: string;
    method: string;
    headers: { [key: string]: string };
    body: {
        size: number;
        form: { [key: string]: string };
        files: { fileName: string, contentType: string, contentLength: number }[];
        content: string;
        encoding: string;
        isTruncated: boolean;
    };
    startTime: string;
    isAjax: boolean;
    clientIp: string;
}
