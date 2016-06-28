import { IRequestDetailRequestDetailsState } from './IRequestDetailRequestDetailsState';
import { IRequestDetailRequestMiddlewareState } from './IRequestDetailRequestMiddlewareState';

export interface IRequestDetailRequestState {
    url: string;
    middleware: IRequestDetailRequestMiddlewareState[];
    request: IRequestDetailRequestDetailsState;
    response: IRequestDetailRequestDetailsState;
}
