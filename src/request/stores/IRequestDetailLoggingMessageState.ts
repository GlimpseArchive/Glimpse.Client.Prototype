export interface IRequestDetailLoggingMessageState {
    level: string;
    message: string;
    isObject: boolean;
    spans: {
        text: string,
        wasReplaced?: boolean 
    }[];
}
