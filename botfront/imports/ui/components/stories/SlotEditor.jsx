import { AutoForm, AutoField, ErrorsField } from 'uniforms-semantic';
import { Segment, Popup, Icon } from 'semantic-ui-react';
import React, { useEffect, useState } from 'react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import PropTypes from 'prop-types';
import { slotSchemas } from '../../../api/slots/slots.schema';
import ConfirmPopup from '../common/ConfirmPopup';
import SaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';

function SlotEditor(props) {
    const {
        slot, onSave, projectId, onDelete, newSlot, deletable, canEditSlots,
    } = props;
    const { type } = slot;
    const { t } = useTranslation();
    const [saved, setSaved] = useState(false);
    const [deletePopupOpen, setDeletePopup] = useState(false);
    const [hover, setHover] = useState(false);
    const [successTimeout, setSuccessTimeout] = useState(0);

    // This effect cleans up the timeout in case the component dismounts
    useEffect(
        () => () => {
            clearTimeout(successTimeout);
        },
        [successTimeout],
    );

    return (
        <Segment
            className={`slot-editor ${newSlot ? 'new' : ''}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onMouseMove={() => setHover(true)}
            data-cy={newSlot ? 'new-slot-editor' : 'slot-editor'}
        >
            <AutoForm
                model={slot}
                schema={new SimpleSchema2Bridge(slotSchemas[type])}
                onSubmit={doc => onSave(doc, () => {
                    setSaved(true);
                    if (!newSlot) {
                        setSuccessTimeout(
                            setTimeout(() => {
                                setSaved(false);
                            }, 2 * 1000),
                        );
                    }
                })
                }
                disabled={!canEditSlots}
            >
                <AutoField name='name' data-cy='slot-name' disabled={!deletable || !canEditSlots} label = {t('nome')}/>
                {type !== 'unfeaturized' && (
                    <AutoField
                        name='initialValue'
                        placeholder={t('slotlabel')}
                        label={t('iv')}
                    />
                )}
                {type === 'float' && (
                    <>
                        <AutoField name='minValue' placeholder='0.0' label = {t('mv')}/>
                        <AutoField name='maxValue' placeholder='1.0' label = {t('maxv')}/>
                    </>
                )}
                {type === 'categorical' && <AutoField name='categories' />}
                <AceField name='mappings' minLines={3} maxLines={5} label='Mappings' mode='yaml' data-cy='ace-field' />
                <AutoField
                    name='projectId'
                    value={projectId}
                    label={false}
                    hidden
                />
                <b>{`${t('type')}:  ${type}`}</b>
                <br />
                <ErrorsField data-cy='errors-field' />
                { canEditSlots && (
                    <TranslatedSaveButton
                        saved={saved}
                        saveText={newSlot ? t('adds') : t('save')}
                    />
                )}
                {hover && canEditSlots && (
                    <>
                        <Popup
                            trigger={(
                                <Icon
                                    name='trash'
                                    color='grey'
                                    link={deletable}
                                    data-cy='delete-slot'
                                    disabled={!deletable}
                                />
                            )}
                            content={(
                                <ConfirmPopup
                                    title={t('dslot')}
                                    onYes={() => onDelete(slot)}
                                    onNo={() => setDeletePopup(false)}
                                />
                            )}
                            on='click'
                            open={deletePopupOpen}
                            onOpen={() => setDeletePopup(true)}
                            disabled={!deletable}
                        />
                        {!deletable && <span className='grey'>{t('dslotmes')}</span>}
                    </>
                )}
            </AutoForm>
        </Segment>
    );
}

SlotEditor.propTypes = {
    slot: PropTypes.object.isRequired,
    onSave: PropTypes.func,
    projectId: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
    newSlot: PropTypes.bool,
    canEditSlots: PropTypes.bool,
    deletable: PropTypes.bool,
};

SlotEditor.defaultProps = {
    onSave: () => {},
    onDelete: () => {},
    newSlot: false,
    canEditSlots: false,
    deletable: true,
};

export default SlotEditor;
