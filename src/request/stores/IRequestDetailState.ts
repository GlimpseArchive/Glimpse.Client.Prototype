import { IRequestDetailDataState } from './IRequestDetailDataState';
import { IRequestDetailLoggingState } from './IRequestDetailLoggingState';

export interface IRequestDetailState {
    data: IRequestDetailDataState;
    logging: IRequestDetailLoggingState;
}
