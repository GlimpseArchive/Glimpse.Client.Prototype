import { selectOperationAction } from '../../../src/request/actions/RequestDetailDataActions';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailDataActions', () => {
    describe('#selectOperationAction', () => {
        it('should return the selected index as payload', () => {
            const selectedIndex = 123;
            const action = selectOperationAction(selectedIndex);
            
            should.exist(action);
            action.should.deep.equal({
                type: 'request.detail.data.select',
                payload: selectedIndex
            });
        });
    });  
});
