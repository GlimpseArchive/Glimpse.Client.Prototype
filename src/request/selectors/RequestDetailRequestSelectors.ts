import { IRequestState } from '../stores/IRequestState';

export const getRequest = (state: IRequestState) => state.detail.request;
