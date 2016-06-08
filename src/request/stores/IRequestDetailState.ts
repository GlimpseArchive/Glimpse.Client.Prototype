import { IRequestDetailDataState } from './IRequestDetailDataState';
import { IRequestDetailLoggingState } from './IRequestDetailLoggingState';
import { IRequestDetailWebServicesState } from './IRequestDetailWebServicesState';

export interface IRequestDetailState {
    data: IRequestDetailDataState;
    logging: IRequestDetailLoggingState;
    webServices: IRequestDetailWebServicesState;
}
