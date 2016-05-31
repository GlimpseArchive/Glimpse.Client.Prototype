export interface ICommandBeforeExecutePayload {
    commandMethod: string;
    commandIsAsync: boolean;
    commandText: string;
    commandType: string;
}
