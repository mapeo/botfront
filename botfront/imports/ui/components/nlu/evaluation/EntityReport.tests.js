import Meteor from 'meteor/meteor';
import chai, { expect } from 'chai';
import EntityReport from './EntityReport';

const example_perfect = {
    text: 'isto é um exemplo',
    intent: 'test',
    entities: [{
        start: 0,
        end: 4,
        value: 'test',
        entity: 'this',
    }],
    predicted: 'test',
    predicted_entities: [{
        start: 0,
        end: 4,
        value: 'test',
        entity: 'this',
    }],
};

const example_overlap = {
    text: 'isto é um exemplo',
    intent: 'test',
    entities: [{
        start: 0,
        end: 4,
        value: 'this',
        entity: 'test',
    }],
    predicted: 'test',
    predicted_entities: [{
        start: 0,
        end: 7,
        value: 'this is',
        entity: 'test',
    }],
};

const example_mismatch = {
    text: 'isto é um exemplo',
    intent: 'test',
    entities: [{
        start: 0,
        end: 4,
        value: 'this',
        entity: 'test',
    }],
    predicted: 'test',
    predicted_entities: [{
        start: 0,
        end: 7,
        value: 'this is',
        entity: 'another',
    }],
};

const example_not_found = {
    text: 'isto é um exemplo',
    intent: 'test',
    entities: [{
        start: 0,
        end: 4,
        value: 'this',
        entity: 'test',
    }],
    predicted: 'test',
    predicted_entities: [{
        start: 11,
        end: 18,
        value: 'example',
        entity: 'another',
    }],
};

const example_surprise = {
    text: 'isto é um exemplo',
    intent: 'test',
    entities: [],
    predicted: 'test',
    predicted_entities: [{
        start: 0,
        end: 4,
        value: 'this',
        entity: 'test',
    }],
};

if (!Meteor.isServer) {
    describe('correspondência de erros para entidade e previsão', function () {
        const entity1 = { start: 1, end: 5 };
        const entity2 = { start: 0, end: 3 };

        it('sobreposição retorna número de caracteres sobrepostos', function () {
            const overlap = EntityReport.getOverlap(entity1, entity2);
            expect(overlap).to.be.equal(2);
        });

        it('a sobreposição é simétrica', function () {
            const overlap1 = EntityReport.getOverlap(entity1, entity2);
            const overlap2 = EntityReport.getOverlap(entity2, entity1);
            expect(overlap1).to.be.equal(overlap2);
        });

        it('o código de erro corresponde ao tipo correto de erro', function () {
            const perfect_code = EntityReport.getErrorCode(example_perfect.entities[0], example_perfect.predicted_entities[0]);
            const overlap_code = EntityReport.getErrorCode(example_overlap.entities[0], example_overlap.predicted_entities[0]);
            const mismatch_code = EntityReport.getErrorCode(example_mismatch.entities[0], example_mismatch.predicted_entities[0]);
            const not_found_code = EntityReport.getErrorCode(example_not_found.entities[0], example_not_found.predicted_entities[0]);
            const surprise_code = EntityReport.getErrorCode(example_surprise.entities[0], example_surprise.predicted_entities[0]);
            expect(perfect_code).to.be.equal(null);
            expect(overlap_code).to.be.equal(0);
            expect(mismatch_code).to.be.equal(1);
            expect(not_found_code).to.be.equal(2);
            expect(surprise_code).to.be.equal(3);
        });

        it('not_found_error_code para resultado nulo', function () {
            const null_code = EntityReport.getErrorCode(example_perfect.entities[0], null);
            const not_found_code = EntityReport.getErrorCode(example_not_found.entities[0], example_not_found.predicted_entities[0]);
            expect(not_found_code).to.be.equal(null_code);
        });
    });

    describe('encontrando entidades mais próximas', function() {
        it('deve selecionar o mais próximo da lista de possibilidades', function () {
            const closest = EntityReport.findClosestEntity(example_perfect.entities[0], example_mismatch.predicted_entities.concat(example_not_found.predicted_entities));
            expect(closest).to.be.equal(example_mismatch.predicted_entities[0]);
        });

        it('deve retornar nulo se não houver sobreposição', function () {
            const closest = EntityReport.findClosestEntity(example_perfect.entities[0], example_not_found.predicted_entities);
            expect(closest).to.be.equal(null);
        });
    });
}
