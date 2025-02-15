import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { GraphQLBridge } from 'uniforms-bridge-graphql';
import { buildASTSchema, parse, extendSchema } from 'graphql';
import {
    Message, Tab,
} from 'semantic-ui-react';
import {
    AutoField, ErrorsField, LongTextField, ListField, ListItemField, NestField, BoolField,
} from 'uniforms-semantic';

import { cloneDeep } from 'lodash';
import { can } from '../../../lib/scopes';

import ButtonSelectField from '../form_fields/ButtonSelectField';
import SelectField from '../form_fields/SelectField';
import IntentField from '../form_fields/IntentField';
import InfoField from '../utils/InfoField';
import ToggleField from '../common/ToggleField';
import DisplayIf from '../DisplayIf';


import {
    basicSchemaString, defaultModel, schemaData, AutoFormMetadata, panes,
} from './MetadataForm';
import { useTranslation } from 'react-i18next';

function ResponseMetadataForm({
    responseMetadata, onChange, editable, projectId,
}) {
    const { t } = useTranslation();
    const pageEventOptions = [
        {
            text: 'click',
            value: 'click',
        },
        {
            text: 'dblclick',
            value: 'dblclick',
        },
        {
            text: 'mouseenter',
            value: 'mouseenter',
        },
        {
            text: 'mouseleave',
            value: 'mouseleave',
        },
        {
            text: 'mouseover',
            value: 'mouseover',
        },
        {
            text: 'change',
            value: 'change',
        },
        {
            text: 'input',
            value: 'input',
        },
        {
            text: 'blur',
            value: 'blur',
        },
        {
            text: 'focus',
            value: 'focus',
        },
        {
            text: 'focusin',
            value: 'focusin',
        },
        {
            text: 'focusout',
            value: 'focusout',
        },
    ];

    const schema = extendSchema(buildASTSchema(parse(`
    
    type PageChange {
        regex: Boolean
        url: String!
        callbackIntent: String!
    }

    type PageChangeCallbacks {
        enabled: Boolean!
        pageChanges: [PageChange!]
        errorIntent: String!
    }

    type PageEventCallbacks {
        enabled: Boolean!
        pageEvents: [PageEvent!]
    }

    type PageEvent{
        event: String!
        payload: String!
        selector: String!
    }

    type DomHighlight {
        enabled: Boolean!
        style: String!
        selector: String
        css: String
        tooltipPlacement: String
        tooltipClose: String
        tooltipCloseEnabled: Boolean
    }

    type CustomCss {
        enabled: Boolean!
        css: String
        style: String!
    }
    
    ${basicSchemaString}

    # This is required by buildASTSchema
    type Query { anything: ID }
    `)), parse(`
    extend type ResponseMetadata {
        domHighlight: DomHighlight
        pageChangeCallbacks : PageChangeCallbacks
        pageEventCallbacks : PageEventCallbacks
        customCss: CustomCss
    }`)).getType('ResponseMetadata');

    const defaultModelAdvanced = {
        ...defaultModel,
        domHighlight: { style: 'default' },
        customCss: { style: 'class' },
        pageChangeCallbacks: null,
        pageEventCallbacks: null,
    };

    const schemaDataAdvanced = {
        linkTarget: {
            label: t('linklabel'),
            defaultValue: '_blank',
            allowedValues: ['_blank', '_self'],
            options: [
                { text: t('linklabelopenct'), value: '_self', description: t('linklabelopenctdesc') },
                { text: t('linklabelopennt'), value: '_blank', description: t('linklabelopenntdesc') },
            ],
        },
        userInput: {
            label: t('inputlabel'),
            defaultValue: 'show',
            allowedValues: ['show', 'hide', 'disable'],
            options: [
                { text: t('inputlabelshow'), value: 'show', description: t('inputlabelshowdesc') },
                { text: t('inputlabelhide'), value: 'hide', description: t('inputlabelhidedesc') },
                { text: t('inputlabeldisable'), value: 'disable', description: t('inputlabeldisabledesc') },
            ],
        },
        forceOpen: {
            label: t('folabel'),
            defaultValue: false,
        },
        forceClose: {
            label: t('fclabel'),
            defaultValue: false,
        },
        'domHighlight.style': {
            initialValue: 'default',
            allowedValues: ['default', 'class', 'custom'],
            options: [
                {
                    text: t('dstyle'),
                    value: 'default',
                    description: t('dstyledes'),
                },
                {
                    text: t('eclass'),
                    value: 'class',
                    description: t('eclassdes'),
                },
                {
                    text: t('cstyle'),
                    value: 'custom',
                    description: t('cstyledes'),
                },
            ],
        },
        'domHighlight.tooltipPlacement': {
            label: t('tooltipplace'),
            initialValue: 'auto',
            allowedValues: ['left', 'right', 'top', 'bottom', 'auto'],
            options: [
                { text: t('auto'), value: 'auto' },
                { text: t('left'), value: 'left' },
                { text: t('right'), value: 'right' },
                { text: t('top'), value: 'top' },
                { text: t('bottom'), value: 'bottom' },
            ],
        },
        'customCss.style': {
            initialValue: 'class',
            allowedValues: ['class', 'custom'],
            options: [
                {
                    text: t('eclass'),
                    value: 'class',
                    description: t('eclassmes'),
                },
                {
                    text: t('cstyle'),
                    value: 'custom',
                    description: t('cstylemes'),
                },
            ],
        },
    };
    const readOnlyClass = editable ? '' : 'read-only';
    const panesAdvanced = [
        {
            menuItem: t('general'),
            render: () => (
                <div className={readOnlyClass}> {panes[0].render()}
                    <ToggleField name='domHighlight.enabled' className='toggle' label={t('hep')} />
                    <DisplayIf condition={context => context.model.domHighlight && context.model.domHighlight.enabled}>
                        <>
                            <InfoField name='domHighlight.selector' label={t('csselec')} info={t('csselecinfo')} />
                            <ButtonSelectField name='domHighlight.style' />

                            <DisplayIf condition={context => context.model.domHighlight && context.model.domHighlight.style === 'class'}>
                                <AutoField name='domHighlight.css' label={t('cn')} />
                            </DisplayIf>
                            <DisplayIf condition={context => context.model.domHighlight && context.model.domHighlight.style === 'custom'}>
                                <LongTextField className='monospaced' name='domHighlight.css' label={t('cc')} />
                            </DisplayIf>
                            <ButtonSelectField name='domHighlight.tooltipPlacement' />
                            <ToggleField name='domHighlight.tooltipCloseEnabled' className='toggle' label={t('sendtool')} />
                            <DisplayIf condition={context => context.model.domHighlight && context.model.domHighlight.tooltipCloseEnabled}>
                                <IntentField name='domHighlight.tooltipClose' />
                            </DisplayIf>
                        </>
                    </DisplayIf>
                </div>
            ),
        },
        {
            menuItem: t('obs'),
            render: () => (
                <div className={readOnlyClass}>
                    <ToggleField name='pageChangeCallbacks.enabled' className='toggle' label={t('opc')} />
                    <DisplayIf condition={context => context.model.pageChangeCallbacks && context.model.pageChangeCallbacks.enabled}>
                        <>
                            <Message
                                info
                                content={(
                                    <>
                                        {t('opcmes')}
                                    </>
                                )}
                            />

                            <ListField name='pageChangeCallbacks.pageChanges' label={t('pchanges')}>
                                <ListItemField name='$'>
                                    <NestField name=''>
                                        <BoolField name='regex' options={pageEventOptions} />
                                        <AutoField name='url' />
                                        <IntentField name='callbackIntent' label={t('calint')} />
                                    </NestField>
                                </ListItemField>
                            </ListField>
                            <IntentField name='pageChangeCallbacks.errorIntent' label={t('eint')} />
                        </>
                    </DisplayIf>
                    <ToggleField name='pageEventCallbacks.enabled' className='toggle' label={t('obsint')} />
                    <DisplayIf condition={context => context.model.pageEventCallbacks && context.model.pageEventCallbacks.enabled}>
                        <>
                            <Message
                                info
                                content={(
                                    <>
                                        {t('obsintmes')}
                                    </>
                                )}
                            />
                            <ListField name='pageEventCallbacks.pageEvents' label={t('pevents')}>
                                <ListItemField name='$'>
                                    <NestField name=''>
                                        <SelectField name='event' label={t('event')} options={pageEventOptions} />
                                        <AutoField name='selector' label={t('selecto')} />
                                        <IntentField name='payload' label={t('calint')} />
                                    </NestField>
                                </ListItemField>
                            </ListField>
                        </>
                    </DisplayIf>
                </div>
            ),
        },
        {
            menuItem: t('ma'),
            render: () => (
                <div className={readOnlyClass}>
                    <ToggleField name='customCss.enabled' className='toggle' label={t('malabel')} />
                    <DisplayIf condition={context => context.model.customCss && context.model.customCss.enabled}>
                        <>
                            <ButtonSelectField name='customCss.style' data-cy='style-dropdown' />
                            <DisplayIf condition={context => context.model.customCss && context.model.customCss.style === 'custom'}>
                                <LongTextField className='monospaced' name='customCss.css' label={t('cc')} data-cy='custom-message-css' />
                            </DisplayIf>
                            <DisplayIf condition={context => context.model.customCss && context.model.customCss.style === 'class'}>
                                <AutoField name='customCss.css' label={t('cclass')} data-cy='custom-message-css' />
                            </DisplayIf>
                        </>
                    </DisplayIf>
                </div>
            ),
        },
    ];

    const addSlashIfNeeded = (payload) => {
        // regex for begin with a /
        if (payload.match(/^\//)) return payload;
        return `/${payload}`;
    };

    const removeSlashIfNeeded = (payload) => {
        if (payload.match(/^\//)) return payload.slice(1);
        return payload;
    };

    const postProcess = (model) => {
        const newModel = cloneDeep(model);
        // Remove objects if they were disabled
        if (newModel.domHighlight && !newModel.domHighlight.enabled) delete newModel.domHighlight;
        if (newModel.customCss && !newModel.customCss.enabled) delete newModel.customCss;
        if (newModel.pageChangeCallbacks && !newModel.pageChangeCallbacks.enabled) delete newModel.pageChangeCallbacks;
        if (newModel.pageEventCallbacks && !newModel.pageEventCallbacks.enabled) delete newModel.pageEventCallbacks;
        // Remove enabled fields
        if (newModel.domHighlight && newModel.domHighlight.enabled) delete newModel.domHighlight.enabled;

        if (newModel.domHighlight && !newModel.domHighlight.tooltipCloseEnabled) {
            delete newModel.domHighlight.tooltipClose
        }
        if (newModel.domHighlight) {
            delete newModel.domHighlight.tooltipCloseEnabled
        }

        if (newModel.customCss && newModel.customCss.enabled) delete newModel.customCss.enabled;
        if (newModel.pageChangeCallbacks && newModel.pageChangeCallbacks.enabled) {
            delete newModel.pageChangeCallbacks.enabled;
            newModel.pageChangeCallbacks.errorIntent = addSlashIfNeeded(newModel.pageChangeCallbacks.errorIntent);
            newModel.pageChangeCallbacks.pageChanges = newModel.pageChangeCallbacks.pageChanges.map(pageChange => ({ ...pageChange, callbackIntent: addSlashIfNeeded(pageChange.callbackIntent) }));
        }
        if (newModel.pageEventCallbacks && newModel.pageEventCallbacks.enabled) {
            delete newModel.pageEventCallbacks.enabled;
            newModel.pageEventCallbacks.pageEvents = newModel.pageEventCallbacks.pageEvents.map(pageEvent => ({ ...pageEvent, payload: addSlashIfNeeded(pageEvent.payload) }));
        }

        return newModel;
    };

    const getPageChangeErrors = ({ pageChangeCallbacks }) => {
        const errors = [];
        if (pageChangeCallbacks && pageChangeCallbacks.enabled) {
            if (!pageChangeCallbacks || !pageChangeCallbacks.pageChanges || pageChangeCallbacks.pageChanges.length < 1) {
                errors.push({ name: 'pageChangeCallback.pageChanges', message: t('erromes') });
            }
        }

        if (pageChangeCallbacks && pageChangeCallbacks.enabled && pageChangeCallbacks.pageChanges && pageChangeCallbacks.pageChanges.length) {
            const missing = [];
            pageChangeCallbacks.pageChanges.forEach((i) => {
                if (!i.url || !i.url.length < 0 || !i.callbackIntent || !i.callbackIntent.length < 0) { missing.push(i); }
            });
            if (missing.length) {
                errors.push({ name: 'pageChangeCallback.pageChanges', message: t('erromes1') });
            }

            if (!pageChangeCallbacks.errorIntent || pageChangeCallbacks.length < 1) {
                errors.push({ name: 'pageChangeCallback.pageChanges.errorIntent', message: t('erromes2') });
            }
        }
        return errors;
    };

    const getPageEventErrors = ({ pageEventCallbacks }) => {
        const errors = [];
        if (pageEventCallbacks && pageEventCallbacks.enabled) {
            if (!pageEventCallbacks || !pageEventCallbacks.pageEvents || pageEventCallbacks.pageEvents.length < 1) {
                errors.push({ name: 'pageEventCallback.pageEvents', message: t('erromes3') });
            }
        }

        if (pageEventCallbacks && pageEventCallbacks.pageEvents && pageEventCallbacks.pageEvents.length) {
            const missing = [];
            pageEventCallbacks.pageEvents.forEach((i) => {
                if (!i.event || !i.event.length < 0 || !i.payload || !i.payload.length < 0 || !i.selector || !i.selector.length < 0) { missing.push(i); }
            });
            if (missing.length) {
                errors.push({ name: 'pageEventCallback.pageEvents', message: t('erromes4') });
            }
        }
        return errors;
    };

    const validator = (model) => {
        const errors = [...getPageChangeErrors(model), ...getPageEventErrors(model)];

        if (model.customCss && model.customCss.enabled && !model.customCss.css) {
            errors.push({ name: 'customCss', message: t('erromes5') });
        }

        if (model.domHighlight
            && model.domHighlight.enabled
            && (
                !model.domHighlight.selector || !model.domHighlight.selector.length
            )
        ) {
            errors.push({ name: 'domHighlight', message: t('erromes6') });
        }

        if (errors.length) {
            // eslint-disable-next-line no-throw-literal
            throw { details: errors };
        }
    };

    const preprocessModel = (model) => {
        const newModel = cloneDeep(model);
        if (newModel.domHighlight && (newModel.domHighlight.selector)) newModel.domHighlight.enabled = true;
        if (newModel.domHighlight && (newModel.domHighlight.tooltipClose)) newModel.domHighlight.tooltipCloseEnabled = true;
        if (newModel.pageChangeCallbacks && (newModel.pageChangeCallbacks.pageChanges.length > 0)) {
            newModel.pageChangeCallbacks.enabled = true;
            newModel.pageChangeCallbacks.errorIntent = removeSlashIfNeeded(newModel.pageChangeCallbacks.errorIntent);
            newModel.pageChangeCallbacks.pageChanges = newModel.pageChangeCallbacks.pageChanges.map(pageChange => ({ ...pageChange, callbackIntent: removeSlashIfNeeded(pageChange.callbackIntent) }));
        }
        if (newModel.pageEventCallbacks && (newModel.pageEventCallbacks.pageEvents.length > 0)) {
            newModel.pageEventCallbacks.enabled = true;
            newModel.pageEventCallbacks.pageEvents = newModel.pageEventCallbacks.pageEvents.map(pageEvent => ({ ...pageEvent, payload: removeSlashIfNeeded(pageEvent.payload) }));
        }
        if (newModel.customCss && newModel.customCss.css) newModel.customCss.enabled = true;

        return newModel;
    };

    const [localModel, setLocalModel] = useState(preprocessModel(responseMetadata || defaultModelAdvanced));

    const handleOnChange = (model) => {
        setLocalModel(model);
        onChange(postProcess(model));
    };

    return (
        <div className='response-metadata-form'>
            <AutoFormMetadata
                autosave
                autosaveDelay={250}
                model={localModel}
                schema={new GraphQLBridge(schema, validator, schemaDataAdvanced)}
                onSubmit={handleOnChange}
                disabled={!can('responses:w', projectId)}
            >
                <Tab menu={{ secondary: true, pointing: true }} panes={panesAdvanced} />
                <br />
                <ErrorsField />
                <br />
            </AutoFormMetadata>
        </div>
    );
}
ResponseMetadataForm.propTypes = {
    responseMetadata: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    editable: PropTypes.bool,
    projectId: PropTypes.string.isRequired,
};
ResponseMetadataForm.defaultProps = {
    responseMetadata: {
        linkTarget: '_blank',
        userInput: 'show',
        domHighlight: {},
        customCss: {},
        pageChangeCallbacks: null,
    },
    editable: true,
};
const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ResponseMetadataForm);
