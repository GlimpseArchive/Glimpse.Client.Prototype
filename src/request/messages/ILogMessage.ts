'use strict';

export interface ILogMessageReplacedRegion {
    start: number;
    end: number;
}

export interface ILogMessage {
    level: string;
    message: string;
    replacedRegions?: ILogMessageReplacedRegion[];
}
