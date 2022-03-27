import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export default ({const:{t} = useTranslation()}) => (
    <div style={{ textAlign: 'center' }}>
        <Header as='h1' content={t('greetings')} className='setup-welcome-header' />
        <br />
        <span className='step-text'>{t('newaccount')}</span>
        <br />
        <br />
        <br />
        <br />
        <Link to='/setup/account'><Button data-cy='start-setup' size='big' primary content={t('getstart')} /></Link>
    </div>
);
