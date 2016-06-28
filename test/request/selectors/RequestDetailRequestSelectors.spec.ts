import { IRequestDetailRequestMiddlewareState } from '../../../src/request/stores/IRequestDetailRequestMiddlewareState';
import { IRequestState } from '../../../src/request/stores/IRequestState';
import { getMiddleware } from '../../../src/request/selectors/RequestDetailRequestSelectors';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailRequestSelectors', () => {
    function createState(middleware?: IRequestDetailRequestMiddlewareState[]) : IRequestState {
        return {
            detail: {
                data: {
                    filters: {},
                    operations: [],
                    selectedOperationId: ''
                },
                logging: {
                    messages: [],
                    filters: []
                },
                request: {
                    url: '',
                    middleware: middleware || [],
                    request: {
                        body: '',
                        headers: {}
                    },
                    response: {
                        body: '',
                        headers: {}
                    }
                },
                webServices: {
                    requests: {},
                    selectedRequestId: ''
                }
            }
        };
    }

    function createMiddleware(name: string, packageName: string, headers?: { [key: string]: string }, middleware?: IRequestDetailRequestMiddlewareState[]): IRequestDetailRequestMiddlewareState {
        return {
            headers: headers || {},
            middleware: middleware || [],
            name: name,
            packageName: packageName
        };
    }

    describe('#getMiddleware', () => {
        it('should return no middleware if none executed', () => {
            const state = createState();
            const middleware = getMiddleware(state);

            should.exist(middleware);
            middleware.length.should.equal(0);
        });

        it('should return a middleware if one was executed', () => {
            const state = createState([
                createMiddleware('name', 'package', { name: 'value' })
            ]);
            const middleware = getMiddleware(state);

            should.exist(middleware);
            middleware.should.deep.equal([
                {
                    depth: 0,
                    middleware: {
                        name: 'name',
                        packageName: 'package',
                        headers: {
                            name: 'value'
                        }                    
                    }
                }
            ]);
        });

        it('should return flattened middleware as they were executed', () => {
            const state = createState([
                createMiddleware('name1', 'package1', {}, [
                    createMiddleware('name2', 'package2', {}, [
                        createMiddleware('name3', 'package3')
                    ])
                ]),
                createMiddleware('name4', 'package4')
            ]);
            const middleware = getMiddleware(state);

            should.exist(middleware);
            middleware.should.deep.equal([
                {
                    depth: 0,
                    middleware: {
                        name: 'name1',
                        packageName: 'package1',
                        headers: {}
                    }
                },
                {
                    depth: 1,
                    middleware: {
                        name: 'name2',
                        packageName: 'package2',
                        headers: {}                    }
                },
                {
                    depth: 2,
                    middleware: {
                        name: 'name3',
                        packageName: 'package3',
                        headers: {}                    }
                },
                {
                    depth: 0,
                    middleware: {
                        name: 'name4',
                        packageName: 'package4',
                        headers: {}                    }
                }
            ]);
        });
    });
});
