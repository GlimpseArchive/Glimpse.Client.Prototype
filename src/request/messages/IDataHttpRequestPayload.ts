export const DataHttpRequestType = 'data-http-request';

export interface IDataHttpRequestPayload {
    url: string;
    method: string;
    headers: { [key: string]: string };
}
