import React from 'react';
import PropTypes from 'prop-types';
import ActionPopupContent from './common/ActionPopupContent';
import { useTranslation } from 'react-i18next';

export default function ActionLabel({ value, onChange }) {
    const { t } = useTranslation();
    return (
        <ActionPopupContent
            trigger={(
                <div className='label-container pink'>
                    <div>
                        {t('action')}
                    </div>
                    <div>
                        {value}
                    </div>
                </div>
            )}
            initialValue={value}
            onSelect={action => onChange(action)}
        />
    );
}


ActionLabel.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
