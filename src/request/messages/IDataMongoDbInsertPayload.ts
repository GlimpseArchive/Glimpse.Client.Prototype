export const DataMongoDbInsertType = 'data-mongodb-insert';

export interface IDataMongoDbInsertPayload {
    operation: string;
    docs: ({})[];
    count: number;
    insertedIds: number;
    startTime: string;
    duration: number;
    options?;
    connectionPort: number;
    connectionHost: string;
    database: string;
    collection: string;
}
