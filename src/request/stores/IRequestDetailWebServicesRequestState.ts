export interface IRequestDetailWebServicesRequestState {
    id: string;
    ordinal: number;
    url: string;
    statusCode: number;
    method: string;
    requestHeaders: { [key: string]: string };
    responseHeaders: { [key: string]: string };
}
