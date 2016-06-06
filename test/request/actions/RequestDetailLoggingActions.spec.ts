import { showAllAction, toggleLevelAction } from '../../../src/request/actions/RequestDetailLoggingActions';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailLoggingActions', () => {
    describe('#showAllAction', () => {
        it('should return a show all action', () => {
            const action = showAllAction();
            
            should.exist(action);
            action.should.deep.equal({
                type: 'request.detail.logging.all'
            });
        });
    });
    
    describe('#toggleLevelAction', () => {
        it('should return the index of the toggled level as payload', () => {
            const level = 2;
            const action = toggleLevelAction(level);
            
            should.exist(action);
            action.should.deep.equal({
                type: 'request.detail.logging.toggle',
                payload: level
            });
        });
    });
});
