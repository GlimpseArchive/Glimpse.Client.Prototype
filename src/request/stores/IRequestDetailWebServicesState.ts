import { IRequestDetailWebServicesRequestState } from './IRequestDetailWebServicesRequestState';

export interface IRequestDetailWebServicesState {
    requests: { [key: string]: IRequestDetailWebServicesRequestState }
    selectedRequestId: string;
}
