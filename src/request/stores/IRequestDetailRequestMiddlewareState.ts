export interface IRequestDetailRequestMiddlewareState {
    headers: { [key: string]: { value: string, wasSet: boolean } };
    middleware: IRequestDetailRequestMiddlewareState[];
    name: string;
    packageName: string;
}
