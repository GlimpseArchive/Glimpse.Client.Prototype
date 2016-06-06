export const CommandBeforeExecuteType = 'before-execute-command';

export interface ICommandBeforeExecutePayload {
    commandMethod: string;
    commandIsAsync: boolean;
    commandText: string;
    commandType: string;
}
