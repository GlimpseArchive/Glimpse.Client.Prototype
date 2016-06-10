import { trainCase } from '../../src/lib/StringUtilities';

import * as chai from 'chai';

const should = chai.should();

describe('StringUtilities', () => {
    describe('#trainCase', () => {
        it('should return undefined for an undefined value', () => {
            const newValue = trainCase(undefined);

            should.not.exist(newValue);
        });

        it('should return an empty string for an empty value', () => {
            const newValue = trainCase('');

            should.exist(newValue);
            newValue.should.equal('');
        });

        it('should return a value with only a dash', () => {
            const newValue = trainCase('-');

            should.exist(newValue);
            newValue.should.equal('-');
        });

        it('should convert a value with a leading dash', () => {
            const newValue = trainCase('-test');

            should.exist(newValue);
            newValue.should.equal('-Test');
        });

        it('should convert a value with a trailing dash', () => {
            const newValue = trainCase('test-');

            should.exist(newValue);
            newValue.should.equal('Test-');
        });

        it('should convert a value with a middle dash', () => {
            const newValue = trainCase('test-value');

            should.exist(newValue);
            newValue.should.equal('Test-Value');
        });

        it('should convert a value with double dashes', () => {
            const newValue = trainCase('test--value');

            should.exist(newValue);
            newValue.should.equal('Test--Value');
        });

        it('should convert a value with no dashes', () => {
            const newValue = trainCase('test');

            should.exist(newValue);
            newValue.should.equal('Test');
        });

        it('should return an already train-cased value', () => {
            const newValue = trainCase('Test-Value');

            should.exist(newValue);
            newValue.should.equal('Test-Value');
        });

        it('should preserve existing case', () => {
            const newValue = trainCase('tEsT-vaLuE');

            should.exist(newValue);
            newValue.should.equal('TEsT-VaLuE');
        });

        it('should ignore non-alpha characters in value', () => {
            const newValue = trainCase('1');

            should.exist(newValue);
            newValue.should.equal('1');
        });

        it('should ignore non-alpha characters with dashes in value', () => {
            const newValue = trainCase('1-1');

            should.exist(newValue);
            newValue.should.equal('1-1');
        });
    });
});
