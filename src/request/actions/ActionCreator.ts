import { Action } from 'redux';

interface IActionCreatorAction<TPayload> extends Action {
    payload: TPayload;
}

interface IActionCreatorBase {
    type: string;
}

interface IActionCreator<TPayload> extends IActionCreatorBase {
    (payload: TPayload): IActionCreatorAction<TPayload>;
    unwrap(action: Action): TPayload;
}

interface ISimpleActionCreator extends IActionCreatorBase {
    (): Action;
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

export function createSimpleActionCreator(type: string): ISimpleActionCreator {
    const actionCreator = () => {
        return {
            type: type        
        }
    };
    
    const typedActionCreator = <ISimpleActionCreator>actionCreator;
    
    typedActionCreator.type = type;
    
    return typedActionCreator;
}
