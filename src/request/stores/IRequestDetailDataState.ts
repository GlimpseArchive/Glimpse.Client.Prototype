import { IRequestDetailDataOperationState } from './IRequestDetailDataOperationState';

export interface IRequestDetailDataState {
    operations: IRequestDetailDataOperationState[];
    selectedIndex: number;
}
