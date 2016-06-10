import { IRequestDetailRequestDetailsState } from './IRequestDetailRequestDetailsState';

export interface IRequestDetailRequestState {
    url: string;
    request: IRequestDetailRequestDetailsState;
    response: IRequestDetailRequestDetailsState;
}
