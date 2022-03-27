import React from 'react';

import {
    AutoForm, AutoField, ErrorsField, SubmitField,
} from 'uniforms-semantic';
import PropTypes from 'prop-types';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { accountSetupSchema } from '../../../api/setup';
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import i18next from 'i18next';



// eslint-disable-next-line react/prefer-stateless-function
class StepAccountComponent extends React.Component {
    
    render() {
        const { onSubmit, data, t } = this.props;
        const bridge = new SimpleSchema2Bridge(accountSetupSchema);
        
        return (
            <AutoForm model={data} schema={bridge} onSubmit={onSubmit}>
                <AutoField name='firstName' placeholder={t('fname')} label={null} />
                <AutoField name='lastName' placeholder={t('lname')} label={null} />
                <AutoField name='email' placeholder={t('email')} label={null} />
                <AutoField
                    name='password'
                    placeholder={t('c-pass')}
                    label={null}
                    type='password'
                />
                <AutoField
                    name='passwordVerify'
                    placeholder={t('co-pass')}
                    label={null}
                    type='password'
                />
                <br />
                <ErrorsField />
                <div style={{ textAlign: 'center' }}>
                    <SubmitField
                        data-cy='account-create-button'
                        value={t('create')}
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

const Translated = withTranslation()(StepAccountComponent);

export default Translated;
