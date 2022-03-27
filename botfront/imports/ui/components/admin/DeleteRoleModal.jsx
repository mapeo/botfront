import {
    Modal, Button, Dropdown, Message,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DeleteRoleModal = (props) => {
    const {
        roleName, onConfirm, onCancel, roles,
    } = props;
    const { t } = useTranslation();
    const [fallback, setFallback] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = () => {
        if (!fallback) {
            setError('Please specify a fallback role.');
        } else {
            onConfirm(fallback);
        }
    };
    return (
        <Modal open>
            <Modal.Header>{`${t('del')} ${roleName}`}</Modal.Header>
            <Modal.Content data-cy='delete-role-modal'>
                {t('roledel')}
                <br />
                <br />
                <Dropdown
                    value={fallback}
                    onChange={(_, data) => {
                        setFallback(data.value);
                    }}
                    options={roles}
                    selection
                    placeholder={t('roledelplace')}
                    fluid
                    data-cy='select-fallback-role'
                />
                <br />
                {error && (
                    <Message negative>
                        {error}
                    </Message>
                )}
                <br />
                <Button onClick={onCancel}>{t('cancel')}</Button>
                <Button onClick={handleSubmit} negative>{t('del')}</Button>
            </Modal.Content>
        </Modal>
    );
};

DeleteRoleModal.propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    roleName: PropTypes.string.isRequired,
    roles: PropTypes.array.isRequired,
};

export default DeleteRoleModal;
