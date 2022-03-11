import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router';

export default () => (
    <div style={{ textAlign: 'center' }}>
        <Header as='h1' content='Bem-vindo ao Botfront' className='setup-welcome-header' />
        <br />
        <span className='step-text'>Vamos criar sua conta de administrador</span>
        <br />
        <br />
        <br />
        <br />
        <Link to='/setup/account'><Button data-cy='start-setup' size='big' primary content='Vamos começar' /></Link>
    </div>
);
