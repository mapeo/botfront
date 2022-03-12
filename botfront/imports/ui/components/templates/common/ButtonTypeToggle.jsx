import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';

const ButtonTypeToggle = (props) => {
    const { className, responseType, onToggleButtonType } = props;

    const renderPopupContent = () => {
        if (responseType === 'TextWithButtonsPayload') {
            return 'o botão desaparecerá quando uma nova mensagem for adicionada à conversa';
        }
        if (responseType === 'QuickRepliesPayload') {
            return 'o botão permanecerá visível e clicável';
        }
        return <></>;
    };

    const renderPopupHeader = () => {
        if (responseType === 'TextWithButtonsPayload') {
            return 'Desativar persistência';
        }
        if (responseType === 'QuickRepliesPayload') {
            return 'Ativar persistência';
        }
        return <></>;
    };
    
    return (
        <>
            {(responseType === 'TextWithButtonsPayload' || responseType === 'QuickRepliesPayload') && (
                <Popup
                    className='toggle-button-type-tooltip'
                    on='hover'
                    trigger={(
                        <span className='button-type-toggle'>
                            <IconButton
                                icon='pin'
                                color={null}
                                className={`${responseType === 'TextWithButtonsPayload' ? 'light-green' : 'grey'} ${className}`}
                                onClick={onToggleButtonType}
                            />
                        </span>
                    )}
                    header={renderPopupHeader()}
                    content={renderPopupContent()}
                />
            )}
        </>
    );
};

ButtonTypeToggle.propTypes = {
    onToggleButtonType: PropTypes.func.isRequired,
    responseType: PropTypes.string,
    className: PropTypes.string,
};

ButtonTypeToggle.defaultProps = {
    className: '',
    responseType: null,
};

export default ButtonTypeToggle;
