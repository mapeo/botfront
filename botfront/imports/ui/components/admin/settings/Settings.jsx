import {
    Container, Tab, Message, Button, Header, Confirm, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import {
    AutoForm, SubmitField, AutoField, ErrorsField,
} from 'uniforms-semantic';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { get } from 'lodash';
import { GlobalSettings } from '../../../../api/globalSettings/globalSettings.collection';
import { GlobalSettingsSchema } from '../../../../api/globalSettings/globalSettings.schema';
import AceField from '../../utils/AceField';
import { wrapMeteorCallback } from '../../utils/Errors';
import PageMenu from '../../utils/PageMenu';
import HttpRequestsForm from '../../common/HttpRequestsForm';
import { can } from '../../../../lib/scopes';
import MigrationControl from './MigrationControl';
import { useTranslation, withTranslation } from 'react-i18next';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, confirmModalOpen: false };
    }

    componentDidMount() {
        const { params: { setting } = {}, router } = this.props;
        const { location: { pathname } } = router;
        if (setting && this.getSettingsPanes().findIndex(p => p.name === setting) < 0) {
            router.replace({ pathname: `${pathname.split('/settings')[0]}/settings` });
        }
    }

    setActiveTab = (index) => {
        const { router } = this.props;
        const { location: { pathname } } = router;
        router.push({ pathname: `${pathname.split('/settings')[0]}/settings/${this.getSettingsPanes()[index].name}` });
    };

    onSave = (settings, callback = () => { }) => {
        this.setState({ saving: true });
        Meteor.call(
            'settings.save',
            settings,
            wrapMeteorCallback((...args) => {
                this.setState({ saving: false });
                callback(...args);
            }, 'Settings saved'),
        );
    };

    renderSubmitButton = () => {
        const { t } = this.props;
        return (
            <>
                <ErrorsField />
                {can('global-settings:w', { anyScope: true }) && (
                    <SubmitField value={t('save')} className='primary' data-cy='save-button' />
                )}
            </>
        )
    }

    renderSecurityPane = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Message
                    info
                    icon='question circle'
                    content={(
                        <>
                            {t('secinfo1')} &nbsp;
                            <a
                                target='_blank'
                                rel='noopener noreferrer'
                                href='https://developers.google.com/recaptcha'
                            >
                                {t('secinfo2')}
                            </a>
                            . {t('secinfo3')}
                        </>
                    )}
                />
                <AutoField name='settings.public.reCatpchaSiteKey' label={t('recat')} />
                <AutoField name='settings.private.reCatpchaSecretServerKey' label={t('recatser')} />
                {this.renderSubmitButton()}
            </Tab.Pane>
        );
    }

    renderDefaultNLUPipeline = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Message
                    info
                    icon='question circle'
                    content={t('defnlucontent')}
                />
                <AceField name='settings.public.defaultNLUConfig' label='' convertYaml />
                {this.renderSubmitButton()}
            </Tab.Pane>
        );
    }

    renderDefaultPolicies = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Message
                    info
                    icon='question circle'
                    content={t('dpcontent')}
                />
                <AceField
                    name='settings.private.defaultPolicies'
                    label=''
                    convertYaml
                />
                {this.renderSubmitButton()}
            </Tab.Pane>
        );
    }

    renderDefaultEndpoints = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Message
                    info
                    icon='question circle'
                    content={(
                        <>
                            {t('deinfo1')}{' '}
                            <a
                                target='_blank'
                                rel='noopener noreferrer'
                                href='https://rasa.com/docs/core/server/#endpoint-configuration'
                            >
                                {t('deinfo2')}
                            </a>
                            ) &nbsp;{t('deinfo3')}
                        </>
                    )}
                />
                <AceField
                    name='settings.private.defaultEndpoints'
                    label=''
                    convertYaml
                />
                {this.renderSubmitButton()}
            </Tab.Pane>
        );
    }

    renderDefaultCredentials = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Message
                    info
                    icon='question circle'
                    content={(
                        <>
                            {t('deinfo1')}{' '}
                            <a
                                target='_blank'
                                rel='noopener noreferrer'
                                href='https://rasa.com/docs/core/connectors/'
                            >
                                {t('deinfo2')}
                            </a>
                            ) &nbsp;{t('dcinfo')}
                        </>
                    )}
                />
                <AceField
                    name='settings.private.defaultCredentials'
                    label=''
                    convertYaml
                />
                {this.renderSubmitButton()}
            </Tab.Pane>
        );
    }

    renderDefaultDefaultDomain = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Message
                    info
                    icon='question circle'
                    content={t('dddcontent')}
                />
                <AceField
                    name='settings.private.defaultDefaultDomain'
                    label=''
                    convertYaml
                />
                {this.renderSubmitButton()}
            </Tab.Pane>
        );
    }

    renderIntegrationSettings = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Header as='h3'>{t('inteheader')}</Header>
                <AutoField
                    name='settings.private.integrationSettings.slackLink'
                    label='Slack'
                />
                {this.renderSubmitButton()}
            </Tab.Pane>// //
        );
    }

    renderAppearance = () => {
        const { t } = this.props;
        return (
            <Tab.Pane>
                <Message
                    info
                    icon='question circle'
                    content={t('appeacontent')}
                />
                <AutoField name='settings.public.backgroundImages' label={t('bi')} />
                <AutoField name='settings.public.logoUrl' label={t('lu')} />
                <AutoField name='settings.public.smallLogoUrl' label={t('su')} />
                {this.renderSubmitButton()}
            </Tab.Pane>
        );
    }

    renderMisc = () => {
        const { confirmModalOpen } = this.state;
        const { t } = this.props;
        return (
            <>
                <Segment>
                    <AutoField name='settings.private.bfApiHost' label={t('misclabel1')} data-cy='docker-api-host' />
                    <AutoField name='settings.public.chitChatProjectId' label={t('misclabel2')} info='ID of project containing chitchat NLU training data' />
                    <AutoField name='settings.public.docUrl' />
                    {this.renderSubmitButton()}
                </Segment>
                {can('global-admin') && (
                    <Segment>
                        <MigrationControl />
                        <Header>{t('mischeader')}</Header>
                        <span>{t('miscspan')}</span>
                        <br />
                        <br />
                        <Confirm
                            data-cy='rebuild-indices-confirm'
                            open={confirmModalOpen}
                            header={t('miscmodalh')}
                            content={t('miscmodalm')}
                            onCancel={() => this.setState({ confirmModalOpen: false })}
                            onConfirm={() => {
                                Meteor.call('global.rebuildIndexes');
                                this.setState({ confirmModalOpen: false });
                            }}
                        />
                        <Button
                            primary
                            onClick={(e) => {
                                e.preventDefault();
                                this.setState({ confirmModalOpen: true });
                            }}
                            data-cy='rebuild-button'
                        >
                            {t('miscbuttonR')}
                        </Button>
                    </Segment>
                )}
            </>
        );
    }


    getSettingsPanes = () => {
        const { settings, t } = this.props;
        const panes = [
            { name: 'default-nlu-pipeline', menuItem: t('defnlu'), render: this.renderDefaultNLUPipeline },
            { name: 'default-policies', menuItem: t('dp'), render: this.renderDefaultPolicies },
            { name: 'default-credentials', menuItem: t('dc'), render: this.renderDefaultCredentials },
            { name: 'default-endpoints', menuItem: t('de'), render: this.renderDefaultEndpoints },
            {
                name: 'default-default-domain',
                menuItem: t('ddd'),
                render: this.renderDefaultDefaultDomain,
            },
            {
                name: 'webhooks',
                menuItem: t('wh'),
                render: () => (
                    <Tab.Pane>
                        <HttpRequestsForm
                            onSave={this.onSave}
                            path='settings.private.webhooks.'
                            urls={get(settings, 'settings.private.webhooks', {})}
                            editable={can('global-settings:w')}
                        />
                    </Tab.Pane>
                ),
            },
            {
                name: 'integration',
                menuItem: t('inte'),
                render: this.renderIntegrationSettings,
            },
            { name: 'security', menuItem: t('sec'), render: this.renderSecurityPane },
            { name: 'appearance', menuItem: t('appea'), render: this.renderAppearance },
            { name: 'misc', menuItem: t('misc'), render: this.renderMisc },
        ];

        return panes;
    };

    renderSettings = (saving, settings) => {
        const { t, params: { setting } = {} } = this.props;
        return (
            <>
                <PageMenu icon='setting' title={t('gs')} />
                <Container id='admin-settings' data-cy='admin-settings-menu'>
                    <AutoForm schema={new SimpleSchema2Bridge(GlobalSettingsSchema)} model={settings} onSubmit={this.onSave} disabled={saving || !can('global-settings:w', { anyScope: true })}>
                        <Tab
                            menu={{ vertical: true, 'data-cy': 'settings-menu' }}
                            grid={{ paneWidth: 13, tabWidth: 3 }}
                            panes={this.getSettingsPanes()}
                            activeIndex={setting ? this.getSettingsPanes().findIndex(p => p.name === setting) : 0}
                            onTabChange={(_, data) => {
                                if (this.getSettingsPanes()[data.activeIndex].name) this.setActiveTab(data.activeIndex);
                            }}
                        />
                    </AutoForm>
                </Container>
            </>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { settings, ready } = this.props;
        const { saving, activePane } = this.state;
        if (ready) return this.renderSettings(saving, settings, activePane);
        return this.renderLoading();
    }
}

Settings.propTypes = {
    settings: PropTypes.object,
    // ⚠️ Don't remove this, it is used on OS
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

Settings.defaultProps = {
    settings: {},
};

const SettingsContainer = withTracker((props) => {
    const handler = Meteor.subscribe('settings');
    const settings = GlobalSettings.findOne({ _id: 'SETTINGS' });
    return {
        ready: handler.ready(),
        settings,
        ...props,
    };
})(Settings);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const TranslatedSettings = withTranslation()(SettingsContainer)
export default connect(mapStateToProps)(TranslatedSettings);
