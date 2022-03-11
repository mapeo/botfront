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

    onSave = (settings, callback = () => {}) => {
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

    renderSubmitButton = () => (
        <>
            <ErrorsField />
            {can('global-settings:w', { anyScope: true }) && (
                <SubmitField value='Salvar' className='primary' data-cy='save-button' />
            )}
        </>
    )

    renderSecurityPane = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={(
                    <>
                        Se você deseja proteger sua página de login com Catpcha. &nbsp;
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://developers.google.com/recaptcha'
                        >
                            Obtenha suas chaves aqui
                        </a>
                        . Somente v2 é suportado.
                    </>
                )}
            />
            <AutoField name='settings.public.reCatpchaSiteKey' label='Chave do site reCAPTCHA'/>
            <AutoField name='settings.private.reCatpchaSecretServerKey' label='Chave secreta do servidor reCAPTCHA' />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderDefaultNLUPipeline = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content='Padrão NLU pipeline para novos modelos NLU'
            />
            <AceField name='settings.public.defaultNLUConfig' label='' convertYaml />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderDefaultPolicies = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content='Políticas padrão para novos projetos'
            />
            <AceField
                name='settings.private.defaultPolicies'
                label=''
                convertYaml
            />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderDefaultEndpoints = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={(
                    <>
                        Padrão Rasa (veja{' '}
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://rasa.com/docs/core/server/#endpoint-configuration'
                        >
                            documentação Rasa
                        </a>
                        ) &nbsp;endpoints para novos projetos
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

    renderDefaultCredentials = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={(
                    <>
                        Padrão Rasa (veja{' '}
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://rasa.com/docs/core/connectors/'
                        >
                            documentação Rasa
                        </a>
                        ) &nbsp;credenciais de canal para novos projetos
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

    renderDefaultDefaultDomain = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content={<>Domínio padrão para novos projetos</>}
            />
            <AceField
                name='settings.private.defaultDefaultDomain'
                label=''
                convertYaml
            />
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderIntegrationSettings = () => (
        <Tab.Pane>
            <Header as='h3'>Links para configuração de Handoff</Header>
            <AutoField
                name='settings.private.integrationSettings.slackLink'
                label='Slack'
            />
            {this.renderSubmitButton()}
        </Tab.Pane>// //
    );

    renderAppearance = () => (
        <Tab.Pane>
            <Message
                info
                icon='question circle'
                content='URLs das imagens de fundo da página de login'
            />
            <AutoField name='settings.public.backgroundImages' label='Imagem de fundo'/>
            <AutoField name='settings.public.logoUrl' label='URL logo'/>
            <AutoField name='settings.public.smallLogoUrl' label='URL logo pequeno'/>
            {this.renderSubmitButton()}
        </Tab.Pane>
    );

    renderMisc = () => {
        const { confirmModalOpen } = this.state;
        return (
            <>
                <Segment>
                    <AutoField name='settings.private.bfApiHost' label='Botfront API host' data-cy='docker-api-host' />
                    <AutoField name='settings.public.chitChatProjectId' label='ID do projeto Chitchat' info='ID of project containing chitchat NLU training data' />
                    <AutoField name='settings.public.docUrl' label='URL do documento' />
                    {this.renderSubmitButton()}
                </Segment>
                {can('global-admin') && (
                    <Segment>
                        <MigrationControl />
                        <Header>Reconstruir índices de pesquisa</Header>
                        <span>Use essa opção apenas se tiver problemas com histórico de pesquisa.</span>
                        <br />
                        <br />
                        <Confirm
                            data-cy='rebuild-indices-confirm'
                            open={confirmModalOpen}
                            header='Reconstruir índices de pesquisa para todos os projetos'
                            content='Esta é uma ação segura que é executada em segundo plano, mas pode levar algum tempo.'
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
                        Reconstruir
                        </Button>
                    </Segment>
                )}
            </>
        );
    }


    getSettingsPanes = () => {
        const { settings } = this.props;
        const panes = [
            { name: 'default-nlu-pipeline', menuItem: 'NLU Pipeline padrão', render: this.renderDefaultNLUPipeline },
            { name: 'default-policies', menuItem: 'Políticas padrão', render: this.renderDefaultPolicies },
            { name: 'default-credentials', menuItem: 'Credenciais padrão', render: this.renderDefaultCredentials },
            { name: 'default-endpoints', menuItem: 'Endpoints padrão', render: this.renderDefaultEndpoints },
            {
                name: 'default-default-domain',
                menuItem: 'Domínio padrão',
                render: this.renderDefaultDefaultDomain,
            },
            {
                name: 'webhooks',
                menuItem: 'Webhooks',
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
                menuItem: 'Integração',
                render: this.renderIntegrationSettings,
            },
            { name: 'security', menuItem: 'Segurança', render: this.renderSecurityPane },
            { name: 'appearance', menuItem: 'Aparência', render: this.renderAppearance },
            { name: 'misc', menuItem: 'Diverso', render: this.renderMisc },
        ];

        return panes;
    };

    renderSettings = (saving, settings) => {
        const { params: { setting } = {} } = this.props;
        return (
            <>
                <PageMenu icon='setting' title='Configurações globais' />
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

export default connect(mapStateToProps)(SettingsContainer);
