import React from 'react';

import {
    AutoForm, AutoField, ErrorsField, SubmitField,
} from 'uniforms-semantic';
import PropTypes from 'prop-types';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { accountSetupSchema } from '../../../api/setup';

// eslint-disable-next-line react/prefer-stateless-function
class StepAccountComponent extends React.Component {
    render() {
        const { onSubmit, data } = this.props;
        const bridge = new SimpleSchema2Bridge(accountSetupSchema);
        return (
            <AutoForm model={data} schema={bridge} onSubmit={onSubmit}>
                <AutoField name='firstName' placeholder='Nome' label={null} />
                <AutoField name='lastName' placeholder='Sobrenome' label={null} />
                <AutoField name='email' placeholder='Email' label={null} />
                <AutoField
                    name='password'
                    placeholder='Digite uma senha'
                    label={null}
                    type='password'
                />
                <AutoField
                    name='passwordVerify'
                    placeholder='Confirme sua senha'
                    label={null}
                    type='password'
                />
                <br />
                <ErrorsField />
                <div style={{ textAlign: 'center' }}>
                    <SubmitField
                        data-cy='account-create-button'
                        value='Criar'
                        className='primary'
                    />
                </div>
            </AutoForm>
        );
    }
}

StepAccountComponent.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    data: PropTypes.object,
};

StepAccountComponent.defaultProps = {
    data: undefined,
};

export default StepAccountComponent;
