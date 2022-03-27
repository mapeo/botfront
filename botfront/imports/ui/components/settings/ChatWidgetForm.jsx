import React from 'react';
import {
    Message,
    Accordion,
    Icon,
    Form,
    Input,
    Header,
    Divider,
    Button,
    Select,
    Menu,
    Loader,
} from 'semantic-ui-react';
import {
    AutoField, AutoForm, LongTextField, ErrorsField,
} from 'uniforms-semantic';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import { safeLoad } from 'js-yaml';
import ToggleField from '../common/ToggleField';
import SelectField from '../form_fields/SelectField';
import { Credentials as CredentialsCollection } from '../../../api/credentials';
import { chatWidgetSettingsSchema } from '../../../api/project/project.schema';
import { wrapMeteorCallback } from '../utils/Errors';
import 'react-s-alert/dist/s-alert-default.css';
import SaveButton from '../utils/SaveButton';
import { can } from '../../../lib/scopes';
import ChangesSaved from '../utils/ChangesSaved';
import IntentField from '../form_fields/IntentField';
import { ProjectContext } from '../../layouts/context';
import InfoField from '../utils/InfoField';
import { withTranslation } from 'react-i18next';

const ColorField = React.lazy(() => import('../form_fields/ColorField'));
class ChatWidgetForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            saved: false,
            copied: false,
            advancedVisible: false,
            showConfirmation: false,
            selectedEnvironment: 'development',
            activeMenu: 'Configuration',
        };
    }

    componentDidMount() {
        const {
            project: { defaultLanguage, chatWidgetSettings = {}, _id: projectId },
        } = this.context;
        if (
            chatWidgetSettings
            && chatWidgetSettings.customData
            && !chatWidgetSettings.customData.language
        ) {
            Meteor.call('project.update', {
                _id: projectId,
                chatWidgetSettings: {
                    ...chatWidgetSettings,
                    customData: { language: `${defaultLanguage}` },
                },
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    getlanguageOptions = () => {
        const { projectLanguages } = this.context;
        const options = projectLanguages.map(lang => ({
            text: lang.text,
            key: lang.value,
            // eslint-disable-next-line no-useless-escape
            value: `{\"language\":\"${lang.value}\"}`, // we need the double quotes because it's a json
        }));
        return options;
    }

    getSnippetString() {
        const { credentials } = this.props;
        const {
            project: { chatWidgetSettings = {} },
        } = this.context;
        const { selectedEnvironment } = this.state;
        const credential = safeLoad(credentials[selectedEnvironment]);
        let channel = credential['rasa_addons.core.channels.webchat.WebchatInput'];
        if (!channel) {
            channel = credential['rasa_addons.core.channels.webchat_plus.WebchatPlusInput'];
        }
        // eslint-disable-next-line max-len
        const snippet = `<script>!function(){let e=document.createElement("script"),t=document.head||document.getElementsByTagName("head")[0];e.src="https://storage.googleapis.com/cdn.botfront.cloud/botfront-widget-latest.js",e.async=!0,e.onload=(()=>{window.WebChat.default({customData:${JSON.stringify(
            chatWidgetSettings.customData,
        )},socketUrl:"${
            channel.base_url
        }"}, null)}),t.insertBefore(e,t.firstChild)}();</script>`;
        return snippet;
    }

    toogleAdvanced = () => {
        const { advancedVisible } = this.state;
        this.setState({ advancedVisible: !advancedVisible });
    };

    onSave = (settings) => {
        const newSettings = settings;
        const { projectId } = this.props;
        newSettings.customData = JSON.parse(newSettings.customData);
        const { initPayload } = newSettings;
        if (initPayload) {
            newSettings.initPayload = initPayload.startsWith('/')
                ? initPayload
                : `/${initPayload}`;
        }
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.successTimeout);
        Meteor.call(
            'project.update',
            {
                _id: projectId,
                chatWidgetSettings: newSettings,
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
                this.setState({ saving: false, showConfirmation: true });
            }),
        );
    };

    // eslint-disable-next-line class-methods-use-this
    copySnippet = () => {
        const copyText = document.getElementById('snippet');
        copyText.select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    };

    handleCopy = () => {
        this.copySnippet();
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 1000);
    };

    handleEnvClick = (e, { name }) => this.setState({ selectedEnvironment: name });

    renderInstall = () => {
        const { copied, selectedEnvironment } = this.state;
        const {
            project: { deploymentEnvironments: availableEnvs = [] },
        } = this.context;
        const { t } = this.props;
        return (
            <>
                <Message
                    info
                    content={t('cwmes')}
                />
                <Form>
                    <Input
                        action
                        value={this.getSnippetString()}
                        id='snippet'
                        fluid
                        className='copiable-code'
                    >
                        <input />

                        {availableEnvs && availableEnvs.length > 0 && (
                            <Select
                                options={['development', ...availableEnvs].map(env => ({
                                    value: env,
                                    text: env,
                                }))}
                                onChange={(e, data) => {
                                    this.setState({ selectedEnvironment: data.value });
                                }}
                                value={selectedEnvironment}
                                data-cy='envs-selector'
                            />
                        )}

                        <Button
                            positive={copied}
                            onClick={(e) => {
                                e.preventDefault();
                                this.handleCopy();
                            }}
                            className='copy-button'
                            icon='copy'
                            content={copied ? t('copied') : t('copy')}
                            data-cy='copy-webchat-snippet'
                        />
                    </Input>
                </Form>
            </>
        );
    };

    renderWidgetSettings = (saving, settings, projectId) => {
        const { saved, advancedVisible, showConfirmation } = this.state;
        const { t } = this.props;
        return (
            <>
                <Message
                    info
                    icon='question circle'
                    content={t('cwmesconf')}
                />
                <AutoForm
                    disabled={!!saving || !can('projects:w', projectId)}
                    schema={new SimpleSchema2Bridge(chatWidgetSettingsSchema)}
                    model={settings}
                   
                    onSubmit={this.onSave}
                    modelTransform={(mode, model) => {
                        const newModel = cloneDeep(model);
                        if (
                            typeof newModel.customData !== 'string'
                            || newModel.customData === ''
                        ) {
                            newModel.customData = JSON.stringify(
                                newModel.customData || {},
                            );
                        }

                        if (mode === 'validate' || mode === 'submit') {
                            newModel.projectId = projectId;
                        }

                        return newModel;
                    }}
                >
                    <Divider />

                    <Header as='h3'>{t('gen')}</Header>
                    <AutoField label={t('wt')} name='title' data-cy='widget-title' />
                    <AutoField label={t('wsub')} name='subtitle' />
                    <InfoField
                        required={false}
                        info={t('initpayinfo')}
                        Component={IntentField}
                        label={t('initpay')}
                        name='initPayload'
                    />
                    <SelectField
                        data-cy='lang-select'
                        options={this.getlanguageOptions()}
                        name='customData'
                        label={t('lang')}
                    />
                    <ErrorsField />
                    <Divider />

                    <Header as='h3'>{t('colors')}</Header>
                    <ColorField label={t('mwc')} name='mainColor' />
                    <ColorField
                        label={t('cbc')}
                        name='conversationBackgroundColor'
                    />
                    <ColorField label={t('umtx')} name='userTextColor' />
                    <ColorField
                        label={t('umbc')}
                        name='userBackgroundColor'
                    />
                    <ColorField
                        label={t('amtc')}
                        name='assistTextColor'
                    />
                    <ColorField
                        label={t('ambc')}
                        name='assistBackgoundColor'
                    />

                    <Divider />

                    <Accordion>
                        <Accordion.Title
                            active={advancedVisible}
                            index={0}
                            onClick={this.toogleAdvanced}
                        >
                            <Header as='h3' icon>
                                {' '}
                                <Icon name='dropdown' />
                                {t('adv')}
                            </Header>
                        </Accordion.Title>
                        <Accordion.Content active={advancedVisible}>
                            <AutoField
                                label={t('uih')}
                                name='inputTextFieldHint'
                            />
                            <ToggleField
                                label={t('sfsb')}
                                name='showFullScreenButton'
                            />
                            <InfoField
                                label={t('dumc')}
                                required={false}
                                info={t('dumcinfo')}
                                Component={ToggleField}
                                name='displayUnreadCount'
                            />
                            <InfoField
                                label={t('hwnc')}
                                required={false}
                                info={t('hwncinfo')}
                                Component={ToggleField}
                                name='hideWhenNotConnected'
                            />
                            <InfoField
                                label={t('dt')}
                                required={false}
                                info={t('dtinfo')}
                                Component={ToggleField}
                                name='disableTooltips'
                            />
                            <InfoField
                                label={t('acc')}
                                required={false}
                                info={t('accinfo')}
                                Component={ToggleField}
                                name='autoClearCache'
                            />
                            <InfoField
                                required={false}
                                info={t('dtnem')}
                                Component={ToggleField}
                                label={t('dtneminfo')}
                                name='showMessageDate'
                            />
                            <Divider />
                            <AutoField
                                label={t('oli')}
                                name='openLauncherImage'
                            />
                            <AutoField label={t('cli')} name='closeImage' />
                            <AutoField label={t('ap')} name='profileAvatar' />
                            <Divider />
                            <LongTextField
                                className='monospaced'
                                label={t('dhcn')}
                                name='defaultHighlightClassname'
                            />
                            <LongTextField
                                className='monospaced'
                                label={t('dhc')}
                                name='defaultHighlightCss'
                            />
                            <LongTextField
                                className='monospaced'
                                label={t('dhca')}
                                name='defaultHighlightAnimation'
                            />
                        </Accordion.Content>
                    </Accordion>
                    <br />
                    {showConfirmation && (
                        <ChangesSaved
                            onDismiss={() => this.setState({ saved: false, showConfirmation: false })
                            }
                        />
                    )}
                    <SaveButton
                        saved={saved}
                        saving={saving}
                        disabled={!!saving || !can('projects:w', projectId)}
                    />
                </AutoForm>
            </>
        );
    };

    renderLoading = () => <div />;

    renderContents = () => {
        const { saving, activeMenu } = this.state;
        const {
            project: { chatWidgetSettings = {}, _id: projectId },
        } = this.context;
        const { initPayload } = chatWidgetSettings;
        if (initPayload) {
            chatWidgetSettings.initPayload = initPayload.startsWith('/')
                ? initPayload.slice(1)
                : initPayload;
        }
        if (activeMenu === 'Configuration') {
            return this.renderWidgetSettings(saving, chatWidgetSettings, projectId);
        }
        return this.renderInstall();
    };

    handleMenuClick = (e, { name }) => this.setState({ activeMenu: name });

    static contextType = ProjectContext;

    render() {
        const { ready, t } = this.props;
        const { activeMenu } = this.state;
        if (ready) {
            return (
                <div data-cy='widget-form'>
                    <Menu pointing secondary>
                        <Menu.Item
                            name={t('config')}
                            active={activeMenu === 'Configuration'}
                            onClick={this.handleMenuClick}
                        />
                        <Menu.Item
                            data-cy='install'
                            name={t('installation')}
                            active={activeMenu === 'Installation'}
                            onClick={this.handleMenuClick}
                        />
                    </Menu>
                    <React.Suspense fallback={<Loader />}>
                        {this.renderContents()}
                    </React.Suspense>
                </div>
            );
        }
        return this.renderLoading();
    }
}

ChatWidgetForm.propTypes = {
    projectId: PropTypes.string.isRequired,
    credentials: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

ChatWidgetForm.defaultProps = {};

const widgetSettingsContainer = withTracker(({ projectId }) => {
    const handlerCredentials = Meteor.subscribe('credentials', projectId);
    const handlerProject = Meteor.subscribe('projects', projectId);
    const credentials = {};
    CredentialsCollection.find(
        { projectId },
        { fields: { credentials: true, environment: true } },
    )
        .fetch()
        .forEach((credential) => {
            const env = credential.environment || 'development';
            credentials[env] = credential.credentials;
        });

    return {
        ready: handlerCredentials.ready() && handlerProject.ready(),
        credentials,
    };
})(ChatWidgetForm);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const TranslatedwidgetSettingsContainer = withTranslation()(widgetSettingsContainer)
export default connect(mapStateToProps)(TranslatedwidgetSettingsContainer);
