import { IRequestDetailDataState } from './IRequestDetailDataState';
import { IRequestDetailLoggingState } from './IRequestDetailLoggingState';
import { IRequestDetailRequestState } from './IRequestDetailRequestState';
import { IRequestDetailWebServicesState } from './IRequestDetailWebServicesState';

export interface IRequestDetailState {
    data: IRequestDetailDataState;
    logging: IRequestDetailLoggingState;
    request: IRequestDetailRequestState;
    webServices: IRequestDetailWebServicesState;
}
