export const DataMongoDbReadType = 'data-mongodb-read';

export interface IDataMongoDbReadPayload {
    operation: string;
    query;
    startTime: string;
    duration: number;
    options?;
    connectionPort: number;
    connectionHost: string;
    database: string;
    collection: string;
}
