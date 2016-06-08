export const DataHttpResponseType = 'data-http-response';

export interface IDataHttpResponsePayload {
    url: string;
    statusCode: number;
    headers: { [key: string]: string },
    endTime: string;
    duration: number;
    offset: number;
}
