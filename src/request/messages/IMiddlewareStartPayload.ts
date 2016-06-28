export const MiddlewareStartType = 'middleware-start';

export interface IMiddlewareStartPayload {
    correlationId: string;
    name: string;
    displayName: string;
    packageName: string;
    startTime: string;
}
