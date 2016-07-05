export interface IRequestDetailRequestMiddlewareState {
    headers: { [key: string]: { values: string[], wasSet: boolean } };
    middleware: IRequestDetailRequestMiddlewareState[];
    name: string;
    packageName: string;
}
