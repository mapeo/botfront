import React, { useState, useEffect } from 'react';
import {
    Header, Button, Confirm, Message,
} from 'semantic-ui-react';
import { useMethod } from '../../utils/hooks.js';
import { can } from '../../../../lib/scopes';

const MigrationControl = () => {
    const { data: migrationDb, call: getMigrationStatus } = useMethod('settings.getMigrationStatus');
    const { call: unlockMigration } = useMethod('settings.unlockMigration');

    useEffect(() => {
        getMigrationStatus();
    }, []);

    const [LocalMigration, setLocalMigration] = useState(null);
    const [displayUnlockMessage, setDisplayUnlockMessage] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const migration = LocalMigration || migrationDb;
    return (
        <>
            {migration && can('global-admin') && (
            <>
                <Header>Controle de migrações</Header>
                <p data-cy='migration-version'>Versão atual: {migration.version}</p>
                <p data-cy='migration-latest-version'>Última versão: {migration.latest}</p>
                <p data-cy='migration-status'>Status: {migration.locked ? 'Bloqueado' : 'OK'}</p>
                {migration.locked && (
                    <>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                setConfirmModalOpen(true);
                            }}
                            primary
                        >
                        Desbloquear migração
                        </Button>
                        <Confirm
                            open={confirmModalOpen}
                            header='Desbloquei o controle de migração'
                            content='Tem certeza que deseja continuar?'
                            onConfirm={() => {
                                unlockMigration();
                                setLocalMigration({ ...migration, locked: !migration.locked });
                                setDisplayUnlockMessage(true);
                            }}
                            onCancel={() => setConfirmModalOpen(false)}
                        />
                    </>
                )}
                {!migration.locked && displayUnlockMessage && (
                    <Message positive>
                        <Message.Header>Controle de migração desbloqueado</Message.Header>
                        Reinicie o Botfront para retomar a migração.
                    </Message>
                )}
            </>
            )}
        </>
    );
};

MigrationControl.propTypes = {
};

export default MigrationControl;
