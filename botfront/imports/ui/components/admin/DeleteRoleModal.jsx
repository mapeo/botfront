import {
    Modal, Button, Dropdown, Message,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const DeleteRoleModal = (props) => {
    const {
        roleName, onConfirm, onCancel, roles,
    } = props;
    const [fallback, setFallback] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = () => {
        if (!fallback) {
            setError('Por favor, especifique um papel substituto.');
        } else {
            onConfirm(fallback);
        }
    };
    return (
        <Modal open>
            <Modal.Header>{`Deletar ${roleName}`}</Modal.Header>
            <Modal.Content data-cy='delete-role-modal'>
                Pode haver usuários com essa função, para qual papel você deseja que eles retornem?
                <br />
                <br />
                <Dropdown
                    value={fallback}
                    onChange={(_, data) => {
                        setFallback(data.value);
                    }}
                    options={roles}
                    selection
                    placeholder='Selecione um papel substituto'
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
                <Button onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSubmit} negative>Deletar</Button>
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
