import { Action } from 'redux';

interface IActionCreatorAction<TPayload> extends Action {
    payload: TPayload;
}

interface IActionCreatorBase<TPayload> {
    type: string;
    unwrap(action: Action): TPayload;
}

interface IActionCreator<TPayload> extends IActionCreatorBase<TPayload> {
    (payload: TPayload): IActionCreatorAction<TPayload>;
}

export function createActionCreator<TPayload>(type: string): IActionCreator<TPayload> {
    const actionCreator = (payload: TPayload) => {
        return {
            type: type,
            payload: payload
        }
    };
    
    const typedActionCreator = <IActionCreator<TPayload>>actionCreator;
    
    typedActionCreator.type = type;
    typedActionCreator.unwrap = (action: Action) => {
        return (<IActionCreatorAction<TPayload>>action).payload;
    };
    
    return typedActionCreator;
}
