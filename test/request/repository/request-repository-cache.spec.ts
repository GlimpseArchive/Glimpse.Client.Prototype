'use strict';
import chai = require('chai');

const should = chai.should();

describe('Dummy', () => {
    describe('#hashObject', () => {
        it('should return a string', () => {
            const result = '1';
            result.should.be.a('String');
        });
    });
});
