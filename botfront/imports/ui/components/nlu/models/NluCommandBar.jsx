import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';
import IntentLabel from '../common/IntentLabel';

const NluCommandBar = React.forwardRef((props, ref) => {
    const {
        selection, onSetIntent, onDelete, onCloseIntentPopup, onUndraft,
    } = props;
    
    const intentLabelRef = useRef();
    const selectionIncludesCanonical = selection.some(d => d.metadata?.canonical);
    const selectionIncludesNonDraft = selection.some(d => !d.metadata?.draft);
    const selectionIncludesNullIntent = selection.some(d => !d.intent);
    const selectionIncludesDeleted = selection.some(d => d.deleted);

    useImperativeHandle(ref, () => ({
        openIntentPopup: () => intentLabelRef.current.openPopup(),
    }));

    return (
        <div className='activity-command-bar' data-cy='activity-command-bar'>
            <span>{selection.length} selecionado</span>
            <div className='side-by-side narrow right'>
                {onSetIntent && onCloseIntentPopup && (
                    <>
                        <span className='shortcut'>I</span>
                        <IntentLabel
                            ref={intentLabelRef}
                            detachedModal
                            allowAdditions
                            allowEditing={!selectionIncludesCanonical && !selectionIncludesDeleted}
                            onChange={intent => onSetIntent(selection.map(({ _id }) => _id), intent)}
                            onClose={onCloseIntentPopup}
                            data-cy='intent-shortcut-popup'
                        />
                        <Popup
                            size='mini'
                            inverted
                            content={(() => { // IFFE to avoid a mess with nested ternary condition
                                if (selectionIncludesCanonical) return 'Não é possível alterar o objetivo porque a seleção contém canônicos';
                                if (selectionIncludesDeleted) return 'Não é possível alterar o objetivo, pois a seleção contém exemplos excluídos';
                                return 'Alterar objetivo';
                            })()}
                            trigger={(
                                <div>
                                    <IconButton
                                        basic
                                        size='small'
                                        disabled={selectionIncludesCanonical || selectionIncludesDeleted}
                                        onClick={() => intentLabelRef.current.openPopup()}
                                        color='purple'
                                        icon='tag'
                                        data-cy='edit-intent'
                                    />
                                </div>
                            )}
                        />
                    </>
                )}
                {onDelete && (
                <>
                    <span className='shortcut'>D</span>
                    <Popup
                        size='mini'
                        inverted
                        disabled={!selectionIncludesCanonical}
                        content='Não é possível deletar com uma seleção contendo canônicos'
                        trigger={(
                            <div>
                                <IconButton
                                    size='small'
                                    disabled={selectionIncludesCanonical}
                                    onClick={() => onDelete(selection.map(({ _id }) => _id))}
                                    color='grey'
                                    icon='trash'
                                    data-cy='trash-shortcut'
                                />
                            </div>
                        )}
                    />
                </>
                )}
                {onUndraft && !selectionIncludesNonDraft && (
                    <>
                        <span className='shortcut'>S</span>
                        <Popup
                            size='mini'
                            inverted
                            content={!selectionIncludesNullIntent ? 'Salvar' : 'Não é possível salvar porque alguns exemplos não têm objetivos'}
                            trigger={(
                                <div>
                                    <IconButton
                                        basic
                                        size='small'
                                        onClick={() => onUndraft(selection.map(({ _id }) => _id))}
                                        color='blue'
                                        icon='save'
                                        disabled={selectionIncludesNullIntent}
                                        data-cy='remove-draft'
                                    />
                                </div>
                            )}
                        />
                    </>
                )}
            </div>
        </div>
    );
});

NluCommandBar.propTypes = {
    selection: PropTypes.array,
    onDelete: PropTypes.func,
    onSetIntent: PropTypes.func,
    onCloseIntentPopup: PropTypes.func,
    onUndraft: PropTypes.func,
};

NluCommandBar.defaultProps = {
    selection: [],
    onUndraft: null,
    onDelete: null,
    onSetIntent: null,
    onCloseIntentPopup: null,

};

export default NluCommandBar;
