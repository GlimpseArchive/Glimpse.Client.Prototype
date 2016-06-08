export const WebResponseType = 'web-response';

export interface IWebResponsePayload {
    url: string;
    headers: { [key: string]: string };
    statusCode: number;
    duration: number;
    endTime: string;
    body: {
        size: number;
        content: string;
        encoding: string;
        isTruncated: boolean;
    };
}
