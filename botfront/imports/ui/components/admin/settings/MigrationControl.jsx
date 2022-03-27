import React, { useState, useEffect } from 'react';
import {
    Header, Button, Confirm, Message,
} from 'semantic-ui-react';
import { useMethod } from '../../utils/hooks.js';
import { can } from '../../../../lib/scopes';
import { useTranslation } from 'react-i18next';



const MigrationControl = () => {
    const { data: migrationDb, call: getMigrationStatus } = useMethod('settings.getMigrationStatus');
    const { call: unlockMigration } = useMethod('settings.unlockMigration');

    useEffect(() => {
        getMigrationStatus();
    }, []);

    const { t } = useTranslation();

    const [LocalMigration, setLocalMigration] = useState(null);
    const [displayUnlockMessage, setDisplayUnlockMessage] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const migration = LocalMigration || migrationDb;
    return (
        <>
            {migration && can('global-admin') && (
            <>
                <Header>{t('mg')}</Header>
                <p data-cy='migration-version'>{t('currentversion')}: {migration.version}</p>
                <p data-cy='migration-latest-version'>{t('lv')}: {migration.latest}</p>
                <p data-cy='migration-status'>Status: {migration.locked ? t('locked') : 'OK'}</p>
                {migration.locked && (
                    <>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                setConfirmModalOpen(true);
                            }}
                            primary
                        >
                        {t('um')}
                        </Button>
                        <Confirm
                            open={confirmModalOpen}
                            header={t('umc')}
                            content={t('umcmes')}
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
                        <Message.Header>{t('mcu')}</Message.Header>
                        {t('rbrm')}
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
