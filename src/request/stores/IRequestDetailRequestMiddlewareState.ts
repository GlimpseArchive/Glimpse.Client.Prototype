export interface IRequestDetailRequestMiddlewareState {
    headers: { [key: string]: string };
    middleware: IRequestDetailRequestMiddlewareState[];
    name: string;
    packageName: string;
}
