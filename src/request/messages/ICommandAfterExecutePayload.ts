export interface ICommandAfterExecutePayload {
    commandHadException: boolean;
    commandEndTime: string;
    commandDuration: number;
    commandOffset: number;
}
