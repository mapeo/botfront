import { Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

export default function ChangesSaved({
    title, content, onDismiss,
}) {
    const { t } = useTranslation();
    return (
        <Message positive data-cy='changes-saved' onDismiss={onDismiss}>
            <Message.Header>{t('changessaved')}</Message.Header>
            {content}
        </Message>
    );
}

ChangesSaved.propTypes = {
    title: PropTypes.string,
    content: PropTypes.element,
    onDismiss: PropTypes.func,
};

ChangesSaved.defaultProps = {
    content: <></>,
    title: '',
    onDismiss: null,
};
