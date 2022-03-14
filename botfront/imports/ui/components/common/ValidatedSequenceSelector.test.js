import React from 'react';
import { expect } from 'chai';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import ValidatedSequenceSelector from './ValidatedSequenceSelector';
import { ProjectContext } from '../../layouts/context';

if (Meteor.isClient) {
    configure({ adapter: new Adapter() });
   
      
    describe('SequenceSelector', () => {
        let sequence = null;
        let options = null;
        let sequenceSelector = null;

        function onChange(newSequence) {
            sequence = newSequence;
        }

        beforeEach(function() {
            sequence = [
                { excluded: false, name: 'action_test', type: 'action' },
            ];
            options = [
                { key: 'action_test', text: 'action_test', value: { excluded: false, name: 'action_test', type: 'action' } },
            ];
            sequenceSelector = mount(
                <ProjectContext.Provider
                    value={{
                        getCanonicalExamples: () => ([]),
                    }}
                >
                    <ValidatedSequenceSelector
                        sequence={sequence}
                        actionOptions={options}
                        onChange={onChange}
                    />
                </ProjectContext.Provider>,
            );
        });

        it('possível acrescentar um novo passo à sequência', () => {
            sequenceSelector.find('div.event-selector-dropdown')
                .simulate('click')
                .find('div.sequence-addition')
                .first()
                .simulate('click')
                .find('[data-cy="sequence-option-0"]')
                .first()
                .simulate('click');

            expect(sequence).to.deep.equal([
                { excluded: false, name: 'action_test', type: 'action' },
                { excluded: false, name: 'action_test', type: 'action' },
            ]);
        });

        it('possível excluir etapa da sequência', () => {
            sequenceSelector.find('div.event-selector-dropdown')
                .simulate('click')
                .find('div.sequence-addition')
                .first()
                .simulate('click')
                .find('[data-cy="sequence-option-0"]')
                .first()
                .simulate('click');

            sequenceSelector.find('[data-cy="sequence-step-1"]').first()
                .simulate('click');
            expect(sequence).to.deep.equal([
                { excluded: false, name: 'action_test', type: 'action' },
                { excluded: true, name: 'action_test', type: 'action' },
            ]);
        });

        it('não adionar etapas nas opções', () => {
            sequenceSelector.find('div.search > input')
                .first()
                .simulate('focus')
                .simulate('change', { target: { value: 'test' } });
            sequenceSelector.find('[data-cy="add-option"]')
                .first()
                .simulate('click');

         
            expect(sequence).to.deep.equal([
                { excluded: false, name: 'action_test', type: 'action' },
                { excluded: false, name: 'test', type: 'action' },
            ]);
        });

        it('mostra erro quando duas etapas excluídas estão um ao lado do outro', () => {
            // bad sequence
            sequence = [
                { excluded: false, name: 'action_test', type: 'action' },
                { excluded: true, name: 'action_test', type: 'action' },
                { excluded: true, name: 'action_test', type: 'action' }];
            const sequenceSelectorWithError = mount(
                <ProjectContext.Provider
                    value={{
                        getCanonicalExamples: () => ([]),
                    }}
                >
                    <ValidatedSequenceSelector
                        sequence={sequence}
                        actionOptions={options}
                        onChange={onChange}
                    />
                </ProjectContext.Provider>,
            );
            // add a new elements to trigger the validation
            sequenceSelectorWithError.find('div.event-selector-dropdown')
                .simulate('click')
                .find('div.sequence-addition')
                .first()
                .simulate('click')
                .find('[data-cy="sequence-option-0"]')
                .first()
                .simulate('click');
            expect(sequenceSelectorWithError.find('div.negative div.item').text()).to.equal(' Não se pode ter duas exclusões uma ao lado da outra ');
        });

        it('mostra erro quando a sequência começa com a etapa excluída', () => {
            // bad sequence
            sequence = [
                { excluded: true, name: 'action_test', type: 'action' },
                { excluded: false, name: 'action_test', type: 'action' }];
            const sequenceSelectorWithError = mount(
                <ProjectContext.Provider
                    value={{
                        getCanonicalExamples: () => ([]),
                    }}
                >
                    <ValidatedSequenceSelector
                        sequence={sequence}
                        actionOptions={options}
                        onChange={onChange}
                    />
                </ProjectContext.Provider>,
            );
            // add a new elements to trigger the validation
            sequenceSelectorWithError.find('div.event-selector-dropdown')
                .simulate('click')
                .find('div.sequence-addition')
                .first()
                .simulate('click')
                .find('[data-cy="sequence-option-0"]')
                .first()
                .simulate('click');
            expect(sequenceSelectorWithError.find('div.negative div.item').text()).to.equal(' A sequência não pode começar com uma exclusão ');
        });
    });
}
