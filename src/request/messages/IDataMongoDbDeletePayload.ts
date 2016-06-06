export const DataMongoDbDeleteType = 'data-mongodb-delete';

export interface IDataMongoDbDeletePayload {
    operation: string;
    query: string;
    count: number;
    startTime: string;
    duration: number;
    options?;
    connectionPort: number;
    connectionHost: string;
    database: string;
    collection: string;
}
