import { requestDetailUpdateAction } from '../../../src/request/actions/RequestDetailActions';
import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailActions', () => {
    describe('#requestDetailUpdateAction', () => {
        it('should return request as payload', () => {
            const request = {};
            const action = requestDetailUpdateAction(request);
            
            should.exist(action);
            action.should.deep.equal({
                type: 'request.detail.update',
                payload: request
            });
        })
    });
});
