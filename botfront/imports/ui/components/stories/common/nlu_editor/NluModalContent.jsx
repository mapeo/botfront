import React, {
    useState,
    useEffect,
    useReducer,
    useMemo,
    useContext,
    useRef,
    useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { isEqual } from 'lodash';
import {
    Container, Button, Popup, Label,
} from 'semantic-ui-react';
import 'react-select/dist/react-select.css';
import NluTable from '../../../nlu/models/NluTable';
import InsertNlu from '../../../example_editor/InsertNLU';
import ConfirmPopup from '../../../common/ConfirmPopup';
import { ConversationOptionsContext } from '../../Context';
import { can } from '../../../../../lib/scopes';
import { useExamples, useLazyExamples } from '../../../nlu/models/hooks';
import { ProjectContext } from '../../../../layouts/context';

function sameCanonicalGroup(example, payload) {
    // check if these examples are in the same canonical group
    return (
        example.intent === payload.intent
        && (example.entities || []).length === (payload.entities || []).length
        && (example.entities || []).every(entity => (payload.entities || []).find(
            payloadEntity => payloadEntity.entity === entity.entity
                    && payloadEntity.value === entity.value,
        ))
    );
}

const NLUModalContent = React.forwardRef((props, forwardedRef) => {
    const { closeModal, payload } = props;

    const {
        project: { _id: projectId },
        language,
    } = useContext(ProjectContext);
    const { reloadStories } = useContext(ConversationOptionsContext);
    const tableRef = useRef();
    const { data, loading: loadingExamples, refetch } = useExamples({
        projectId,
        language,
        pageSize: -1,
        intents: [payload.intent],
        entities: payload.entities,
        matchEntityName: true,
    });
    const canEdit = can('nlu-data:w', projectId);
    const fetchExamples = useLazyExamples({ projectId, language });

    // always refetch first
    const hasRefetched = useRef(false);
    useEffect(() => {
        if (!hasRefetched.current && typeof refetch === 'function') {
            refetch();
            hasRefetched.current = true;
        }
    }, [refetch]);

    const checkPayloadsMatch = example => example.intent === payload.intent
        && (example.entities || []).length === (payload.entities || []).length
        && (example.entities || []).every(entity => (payload.entities || []).find(
            payloadEntity => payloadEntity.entity === entity.entity,
        ));

    const canonicalizeExample = (newExample, currentExamples) => {
        const exists = currentExamples.some(
            currentExample => sameCanonicalGroup(currentExample, newExample) && !currentExample.deleted,
        );
        if (!exists && checkPayloadsMatch(newExample)) {
            return {
                ...newExample,
                metadata: { canonical: true },
                canonicalEdited: true,
            };
        }
        return newExample;
    };

    const exampleReducer = (state, updatedExamples) => {
        const sortedUpdatedExamples = updatedExamples
            .map(example => ({
                ...example,
                invalid: !checkPayloadsMatch(example),
            }))
            .sort((exampleA, exampleB) => {
                if (exampleA.invalid) {
                    if (exampleB.invalid) return 0;
                    return -1;
                }
                if (exampleA.isNew) {
                    if (exampleB.invalid) return 1;
                    if (exampleB.isNew) return 0;
                    return -1;
                }
                if (exampleA.edited) {
                    if (exampleB.isNew || exampleB.invalid) return 1;
                    if (exampleB.edited) return 0;
                    return -1;
                }
                if (exampleB.invalid || exampleB.isNew || exampleB.edited) return 1;
                return 0;
            });
        const firstChangedItem = sortedUpdatedExamples.findIndex(
            ({ _id }, i) => (state[i] || {})._id !== _id,
        );
        if (firstChangedItem > -1) { tableRef?.current?.scrollToItem(firstChangedItem); }
        return sortedUpdatedExamples;
    };

    const [examples, setExamples] = useReducer(exampleReducer, []);
    useEffect(() => setExamples(data), [data]);
    const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
    const [selection, setSelection] = useState([]);

    const hasInvalidExamples = useMemo(
        () => examples.some(example => example.invalid === true && !example.deleted),
        [examples],
    );

    const onNewExamples = async (incomingExamples) => {
        const existingExamples = await fetchExamples({
            text: incomingExamples.map(({ text }) => text),
        });
        const newExamples = incomingExamples.reduce((acc, curr) => {
            if ([...acc, ...examples].some(ex => ex.text === curr.text)) return acc;
            const existingExample = existingExamples.find(ex => ex.text === curr.text);
            if (existingExample) return [...acc, existingExample]; // if existing, add it without new status
            return [...acc, { ...canonicalizeExample(curr, examples), isNew: true }];
        }, []);
        setExamples([...newExamples, ...examples]);
    };

    const onDeleteExamples = (ids) => {
        const updatedExamples = [...examples];
        const someOriginallyNotDeleted = examples.some(({ _id, deleted }) => !deleted && ids.includes(_id));

        ids.forEach((id) => {
            const removeIndex = examples.findIndex(({ _id }) => _id === id);
            const oldExample = { ...updatedExamples[removeIndex] };
            updatedExamples[removeIndex] = {
                ...oldExample,
                deleted: someOriginallyNotDeleted,
            };
        });
        setExamples(updatedExamples);
        return new Promise(() => ({ data: { deleteExamples: ids, projectId } })); // needed for mutationCallback in parent
    };

    const onUpdateExamples = (examplesUpdate) => {
        const updatedExamples = [...examples];
        examplesUpdate.forEach((example) => {
            const index = examples.findIndex(({ _id }) => _id === example._id);
            const oldExample = examples[index];
            if (isEqual(example, oldExample)) {
                return;
            }

            if (oldExample.intent !== example.intent) { // if the intent have changed it might become a canonical example
                const newExample = canonicalizeExample(example, updatedExamples);
                updatedExamples[index] = {
                    ...updatedExamples[index],
                    ...newExample,
                    metadata: { ...updatedExamples[index].metadata, ...newExample.metadata },
                };
            } else {
                updatedExamples[index] = {
                    ...updatedExamples[index],
                    ...example,
                    metadata: { ...updatedExamples[index].metadata, ...example.metadata },
                };
            }
        

            if (example.isNew) {
                updatedExamples[index] = canonicalizeExample(example, updatedExamples);
            } else {
                updatedExamples[index].edited = true;
            }
        });
        return setExamples(updatedExamples);
    };

    const onSwitchCanonical = async (example) => {
        const updatedExamples = [...examples];
        const newCanonicalIndex = examples.findIndex((exampleMatch) => {
            if (example._id === exampleMatch._id) return true;
            return false;
        });
        const oldCanonicalIndex = examples.findIndex((oldExample) => {
            if (
                sameCanonicalGroup(example, oldExample)
                && oldExample?.metadata?.canonical
            ) {
                return true;
            }
            return false;
        });
        updatedExamples[newCanonicalIndex].metadata.canonical = !example.metadata
            .canonical;
        updatedExamples[newCanonicalIndex].canonicalEdited = true;
        const clearOldCanonical = oldCanonicalIndex !== newCanonicalIndex && oldCanonicalIndex > -1;
        if (clearOldCanonical) {
            updatedExamples[oldCanonicalIndex] = {
                ...updatedExamples[oldCanonicalIndex],
                metadata: { ...example.metadata, canonical: false },
            };
        }
        setExamples(updatedExamples);
        return { changed: clearOldCanonical };
    };

    const saveAndExit = () => {
        Meteor.call('nlu.saveExampleChanges', projectId, language, examples, () => {
            setTimeout(() => reloadStories(), 400);
            closeModal();
        });
    };

    const handleCancel = (e) => {
        if (!canEdit) return closeModal();
        const madeChanges = examples.some(
            ({
                edited, isNew, invalid, canonicalEdited, deleted,
            }) => edited || isNew || invalid || canonicalEdited || deleted,
        );
        if (!madeChanges) {
            e.preventDefault();
            closeModal();
        }
    };

    const cancelButtonRef = useRef();
    useImperativeHandle(forwardedRef, () => ({
        closeModal: () => cancelButtonRef?.current?.ref?.current?.click(),
    }));

    const renderLabelColumn = (row) => {
        const {
            datum: {
                edited, isNew, deleted, entities: cellEntities, intent,
            } = {},
        } = row;
        let text;
        let color;
        let title;
        let message;
        if (deleted) {
            text = 'excluído';
            color = undefined;
            title = 'Exemplo excluído';
            message = 'Você acaba de apagar esta declaração de usuário e ela será removida do conjunto de preparo quando salvo';
        } else if (!checkPayloadsMatch({ intent, entities: cellEntities })) {
            text = 'inválido';
            color = 'red';
            title = 'Exemplo inválido';
            message = 'A intenção e as entidades associadas com esta declaração não correspondem ao payload selecionado. Ou ajustar o objetivo e entidades ou deletar essa declaração';
        } else if (isNew) {
            text = 'novo';
            color = 'yellow';
            title = 'Novo exemplo';
            message = 'Você acrescentou esta declaração e ainda não foi acrescentada à sessão de preparo.';
        } else if (edited) {
            text = 'editado';
            color = 'olive';
            title = 'Exemplo editado';
            message = 'Você editou esta declaração e as alterações ainda não foram guardadas no conjunto de preparo';
        }
        return text ? (
            <Popup
                trigger={(
                    <Label
                        className='nlu-modified-label'
                        color={color}
                        size='mini'
                        data-cy='nlu-modification-label'
                    >
                        {text}
                    </Label>
                )}
                header={title}
                content={message}
            />
        ) : (
            <></>
        );
    };

    if (loadingExamples) return <div>Carregando</div>;
    return (
        <Container>
            <br />
            {canEdit && <InsertNlu onSave={onNewExamples} defaultIntent={payload.intent} skipDraft />}
            <br />
            <NluTable
                ref={tableRef}
                deleteExamples={onDeleteExamples}
                updateExamples={onUpdateExamples}
                switchCanonical={onSwitchCanonical}
                data={examples}
                selection={selection}
                setSelection={setSelection}
                noDrafts
                renderLabelColumn={renderLabelColumn}
                additionalIntentOption={payload.intent}
            />
            <div className='nlu-modal-buttons'>
                {canEdit ? (
                    <>
                        <Popup
                            disabled={!hasInvalidExamples}
                            trigger={(
                                <span>
                                    <Button
                                        color='blue'
                                        onClick={saveAndExit}
                                        disabled={hasInvalidExamples}
                                        data-cy='save-nlu'
                                    >
                                    Salvar e sair
                                    </Button>
                                </span>
                            )}
                            header='Não é possível guardar as alterações'
                            content='Você deve corrigir as afirmações inválidas antes de guardá-las'
                        />
                
                        <Popup
                            trigger={(
                                <Button onClick={handleCancel} data-cy='cancel-nlu-changes' ref={cancelButtonRef}>
                                Cancelar
                                </Button>
                            )}
                            content={(
                                <ConfirmPopup
                                    description='Você tem certeza? Todos os dados que introduziu acima serão descartados!'
                                    onYes={closeModal}
                                    onNo={() => setCancelPopupOpen(false)}
                                />
                            )}
                            disabled={!canEdit}
                            on='click'
                            open={cancelPopupOpen}
                            onClose={() => setCancelPopupOpen(false)}
                            onOpen={() => setCancelPopupOpen(true)}
                        />
                    </>
                ) : (
                    <Button onClick={closeModal} data-cy='close-nlu-modal'>
                    Fechar
                    </Button>
                )}
            </div>
        </Container>
    );
});

NLUModalContent.propTypes = {
    payload: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
};


export default NLUModalContent;
