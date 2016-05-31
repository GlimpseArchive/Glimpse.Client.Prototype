import { getTotalOperationCount, getSelectedOperation } from '../../../src/request/selectors/RequestDetailDataSelectors';
import { IRequestState } from '../../../src/request/stores/IRequestState';
import { IRequestDetailDataOperationState } from '../../../src/request/stores/IRequestDetailDataOperationState';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailDataSelectors', () => {
    
    function createState(operations?: IRequestDetailDataOperationState[], selectedIndex?: number): IRequestState {
        return {
            detail: {
                data: {
                    operations: operations || [],
                    selectedIndex: selectedIndex || 0
                }
            }
        }
    }
    
    function createOperation(index: number): IRequestDetailDataOperationState {
        return {
            command: 'command' + index,
            database: 'db' + index,
            duration: 123,
            operation: 'op' + index,
            recordCount: 456
        };
    }
    
    describe('#getTotalOperationCount', () => {
        it('should return zero for an empty operations collection', () => {
            const count = getTotalOperationCount(createState());
            
            count.should.equal(0);
        });

        it('should return the length of the operations collection', () => {
            const count = getTotalOperationCount(
                createState([
                    createOperation(0),
                    createOperation(1)
                ]));
            
            count.should.equal(2);
        });
    });
    
    describe('#getSelectedOperation', () => {
        it('should return the operation at the selected index', () => {
            const operation0 = createOperation(0);
            const operation1 = createOperation(1);
            const selectedOperation = getSelectedOperation(
                createState([
                    operation0,
                    operation1
                ],
                1));
            
            should.exist(selectedOperation);
            selectedOperation.should.deep.equal(operation1);
        });      

        it('should return undefined if the selected index < 0', () => {
            const operation0 = createOperation(0);
            const operation1 = createOperation(1);
            const selectedOperation = getSelectedOperation(
                createState([
                    operation0,
                    operation1
                ],
                -1));
            
            should.not.exist(selectedOperation);
        });      

        it('should return undefined if the selected index > the operations collection\'s length', () => {
            const operation0 = createOperation(0);
            const operation1 = createOperation(1);
            const selectedOperation = getSelectedOperation(
                createState([
                    operation0,
                    operation1
                ],
                2));
            
            should.not.exist(selectedOperation);
        });      
    });
});
