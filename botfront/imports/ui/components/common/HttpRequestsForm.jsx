import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse } from 'graphql';
import {
    AutoForm, AutoField,
} from 'uniforms-semantic';
import { Divider } from 'semantic-ui-react';
import SelectField from '../form_fields/SelectField';
import TranslatedSaveButton from '../utils/SaveButton';
import { wrapMeteorCallback } from '../utils/Errors';
import { useTranslation } from 'react-i18next';

function HttpRequestsForm(props) {
    const {
        onSave, urls, editable, disableMethodField, path,
    } = props;
    const { t } = useTranslation();
    const [saved, setSaved] = useState(null);
    const [saving, setSaving] = useState(null);
    const schema = buildASTSchema(
        parse(`
        type request {
            name: String!
            url: String!
            ${!disableMethodField ? 'method: String!' : ''}
        }

        # This is required by buildASTSchema
        type Query { anything: ID }
    `),
    ).getType('request');

    const validator = () => { };

    const schemaData = {
        url: {
            label: 'URL',
        },
        method: {
            label: t('httpm'),
            allowedValues: [
                'GET',
                'HEAD',
                'POST',
                'PUT',
                'DELETE',
                'CONNECT',
                'OPTIONS',
                'TRACE',
                'PATCH',
            ],
        },
    };

    useEffect(() => {
        const successTimeout = setTimeout(() => {
            setSaved(null);
        }, 2 * 1000);
        
        return () => { clearTimeout(successTimeout); };
    }, [saved]);

    const handleSave = (key, data) => {
        setSaving(key);
        onSave({ [`${path}${key}`]: data }, wrapMeteorCallback((err) => {
            setSaving(null);
            if (err) {
                setSaved(null);
                return;
            }
            setSaved(key);
        }));
    };
    return Object.keys(urls).map((k, i) => (
        <>
            {i > 0 && <Divider className='url-divider' />}
            <AutoForm
                model={urls[k]}
                schema={new GraphQLBridge(schema, validator, schemaData)}
                onSubmit={data => handleSave(k, data)}
                disabled={!editable}
                key={`url-${i}`}
            >
                <h3>{urls[k].name}</h3>
                <AutoField name='url' data-cy={urls[k].name.replace(/ /g, '-')} />
                {!disableMethodField && <SelectField name='method' />}
                <div className='side-by-side left'>
                    {editable && (
                        <TranslatedSaveButton saved={k === saved} saving={k === saving} />
                    )}
                </div>
            </AutoForm>
        </>
    ));
}

HttpRequestsForm.propTypes = {
    urls: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    editable: PropTypes.bool.isRequired,
    disableMethodField: PropTypes.bool,
    path: PropTypes.string,
};

HttpRequestsForm.defaultProps = {
    path: '',
    disableMethodField: false,
};

export default HttpRequestsForm;
