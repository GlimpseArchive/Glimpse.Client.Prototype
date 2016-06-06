import { IRequestDetailLoggingFilterState } from './IRequestDetailLoggingFilterState';
import { IRequestDetailLoggingMessageState } from './IRequestDetailLoggingMessageState';

export interface IRequestDetailLoggingState {
    messages: IRequestDetailLoggingMessageState[],
    filters: IRequestDetailLoggingFilterState[]
}
