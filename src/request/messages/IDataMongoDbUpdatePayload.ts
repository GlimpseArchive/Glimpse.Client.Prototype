export interface IDataMongoDbUpdatePayload {
    operation: string;
    query;
    updates;
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    startTime: string;
    duration: number;
    options?;
    connectionPort: number;
    connectionHost: string;
    database: string;
    collection: string;
}
