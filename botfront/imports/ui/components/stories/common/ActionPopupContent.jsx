import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popup, Input } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

const ActionPopupContent = (props) => {
    const {
        onSelect, trigger, initialValue, trackOpenMenu,
    } = props;
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState();
    const [actionName, setActionName] = useState(initialValue || '');

    return (
        <Popup
            tabIndex={0}
            trigger={trigger}
            wide
            on='click'
            open={isOpen}
            onOpen={() => {
                setIsOpen(true);
                trackOpenMenu(() => setIsOpen(false));
            }}
            onClose={() => {
                setActionName(initialValue);
                setIsOpen(false);
            }}
        >
            <p className='all-caps-header'>{t('actionlabel')}</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setActionName('');
                    setIsOpen(false);
                    if (actionName.trim()) onSelect(actionName);
                }}
            >
                <Input
                    value={actionName}
                    onChange={e => setActionName(e.target.value.trim())}
                    autoFocus
                />
            </form>
        </Popup>
    );
};

ActionPopupContent.propTypes = {
    onSelect: PropTypes.func,
    trigger: PropTypes.element.isRequired,
    initialValue: PropTypes.string,
    trackOpenMenu: PropTypes.func,
};

ActionPopupContent.defaultProps = {
    onSelect: () => {},
    initialValue: '',
    trackOpenMenu: () => {},
};

export default ActionPopupContent;
