/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Segment, Message } from 'semantic-ui-react';

import { safeLoad } from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';

import BotResponsesContainer from '../../stories/common/BotResponsesContainer';
import CustomResponseEditor from '../common/CustomResponseEditor';
import IconButton from '../../common/IconButton';
import ButtonTypeToggle from '../common/ButtonTypeToggle';

import { addContentType, defaultTemplate } from '../../../../lib/botResponse.utils';

const SequenceEditor = (props) => {
    const {
        name, sequence, onChange, onDeleteVariation, editable, onChangePayloadType,
    } = props;

    const [editorKey, setEditorKey] = useState(uuidv4());

    const getContent = (variation) => {
        const content = safeLoad((variation || {}).content);
        return content.__typename ? content : addContentType(content);
    };

    const renderVariation = (variation, index) => {
        const content = getContent(variation);
        if (!content) return <></>;
        return (
            <Segment
                className={`variation-container ${editable ? '' : 'read-only'}`}
                attached
                key={`variation-${index}-${content.text}`}
                data-cy='variation-container'
            >
                <>
                    {content.__typename !== 'CustomPayload' && (
                        <BotResponsesContainer
                            deleteable
                            name={name}
                            initialValue={content}
                            onChange={value => onChange(value, index)}
                            enableEditPopup={false}
                            tag={`${name}-${index}`}
                        />
                    )}
                    {content.__typename === 'CustomPayload' && (
                        <CustomResponseEditor
                            key={editorKey}
                            content={content}
                            onChange={value => onChange(value, index)}
                        />
                    )}
                    <div className='variation-option-menu'>
                        {editable && (
                        <>
                            <ButtonTypeToggle
                                onToggleButtonType={() => {
                                    if (content.__typename === 'TextWithButtonsPayload') {
                                        onChangePayloadType('QuickRepliesPayload');
                                    }
                                    if (content.__typename === 'QuickRepliesPayload') {
                                        onChangePayloadType('TextWithButtonsPayload');
                                    }
                                }}
                                responseType={content.__typename}
                            />
                            <IconButton
                                id={`delete-${name}-${index}`} // stop the response from saving if the input blur event is the delete button
                                onClick={() => {
                                    if (sequence.length === 1) {
                                        setEditorKey(uuidv4());
                                        const blankTemplate = defaultTemplate(
                                            content.__typename,
                                        );
                                        onChange({ payload: blankTemplate }, 0);
                                        return;
                                    }
                                    onDeleteVariation(index);
                                }}
                                icon='trash'
                            />
                        </>
                        )}
                    </div>
                </>
            </Segment>
        );
    };
    return (
        <>
            {sequence.some(s => getContent(s).__typename === 'CustomPayload') && (
                <Message
                    info
                    style={{ margin: '10px' }}
                    content={(
                        <>
                            A chave <b className='monospace'>personalizada</b> deve ser um <b className='monospace'>objeto</b> e será enviada pela rasa como está.
                            Conteúdo sob outras chaves de nível superior devem ser formatadas de acordo com regras específicas para o canal de saída.
                        </>
                    )}
                />
            )}
            {sequence.map(renderVariation)}
        </>
    );
};

SequenceEditor.propTypes = {
    sequence: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onDeleteVariation: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    onChangePayloadType: PropTypes.func.isRequired,
    editable: PropTypes.bool,
};

SequenceEditor.defaultProps = {
    editable: true,
};

export default SequenceEditor;
