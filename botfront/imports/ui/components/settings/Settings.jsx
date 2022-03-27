import { Container, Menu, Tab } from 'semantic-ui-react';
import React from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import PageMenu from '../utils/PageMenu';
import Credentials from './Credentials';
import Appearance from './Appearance';
import Endpoints from './Endpoints';
import ProjectInfo from './ProjectInfo';
import TranslatedPorjectInfo from './ProjectInfo';
import { can } from '../../../lib/scopes';
import Instances from './Instances';
import Integration from './Integration';
import DefaultDomain from './DefaultDomain';
import ImportExportProject from './ImportExportProject';
import ChatWidgetForm from './ChatWidgetForm';
import GitSettings from './GitSettings';
import { withTranslation } from 'react-i18next';

class Settings extends React.Component {
    componentDidMount() {
        const { params: { setting } = {}, router } = this.props;
        const { location: { pathname } } = router;
        if (setting && this.getSettingsPanes().findIndex(p => p.name === setting) < 0) {
            router.replace({ pathname: `${pathname.split('/settings')[0]}/settings` });
        }
    }

    setActiveTab = (index) => {
        const { router, t } = this.props;
        const { location: { pathname } } = router;
        router.push({ pathname: `${pathname.split('/settings')[0]}/settings/${this.getSettingsPanes()[index].name}` });
    };

    getSettingsPanes = () => {
        const { projectId, t } = this.props;
        const canViewProjects = can('projects:r', projectId);
        const canViewResources = can('resources:r', projectId);
        const canExport = can('export:x', projectId);
        const canImport = can('import:x', projectId);
        const canViewGitCredentials = can('git-credentials:r', projectId);
        const panes = [
            ...(canViewProjects ? [
                {
                    name: 'info',
                    menuItem: <Menu.Item icon='info' content={t('proinfo')} key='Project Info' />,
                    render: () => <Tab.Pane><ProjectInfo /></Tab.Pane>,
                },
                {
                    name: 'credentials',
                    menuItem: <Menu.Item icon='key' content={t('cred')} key='Credentials' />,
                    render: () => <Tab.Pane><Credentials /></Tab.Pane>,
                },
            ] : []),
            ...(canViewResources ? [
                {
                    name: 'instance',
                    menuItem: <Menu.Item icon='server' content={t('instance')} key='Instances' />,
                    render: () => <Tab.Pane><Instances /></Tab.Pane>,
                },
            ] : []),
            ...(canViewProjects ? [
                {
                    name: 'endpoints',
                    menuItem: <Menu.Item icon='code' content={t('endpoints')} key='Endpoints' />,
                    render: () => <Tab.Pane><Endpoints /></Tab.Pane>,
                },
                {
                    name: 'appearance',
                    menuItem: <Menu.Item icon='eye' content={t('appea')} key='Appearance' />,
                    render: () => <Tab.Pane><Appearance /></Tab.Pane>,
                },
                {
                    name: 'widget',
                    menuItem: <Menu.Item icon='chat' name='Chat widget settings' content={t('cw')} key='Chat widget' />,
                    render: () => <Tab.Pane><ChatWidgetForm /></Tab.Pane>,
                },
                {
                    name: 'default-domain',
                    menuItem: <Menu.Item icon='globe' content={t('dd')} key='Default Domain' />,
                    render: () => <Tab.Pane><DefaultDomain /></Tab.Pane>,
                },
                {
                    name: 'integration',
                    menuItem: <Menu.Item icon='cogs' content={t('integration')} key='Integration' />,
                    render: () => <Tab.Pane><Integration /></Tab.Pane>,
                },
            ] : []),
            ...(canImport || canExport ? [
                {
                    name: 'import-export',
                    menuItem: <Menu.Item icon='download' content={t('i/e')} key='Import/Export' />,
                    render: () => <Tab.Pane><ImportExportProject /></Tab.Pane>,
                }] : []),

            ...(canViewGitCredentials ? [{
                name: 'git-credentials',
                menuItem: <Menu.Item icon='git' content={t('gc')} key='Git credentials' />,
                render: () => <Tab.Pane><GitSettings /></Tab.Pane>,
            }] : []),
                
            
        ];
        return panes;
    };

    render() {
        const { t, params: { setting } = {} } = this.props;
        return (
            <>
                <PageMenu title={t('settings')} icon='setting' />
                <Container>
                    <Tab
                        menu={{ vertical: true, 'data-cy': 'settings-menu' }}
                        grid={{ paneWidth: 12, tabWidth: 4 }}
                        panes={this.getSettingsPanes()}
                        activeIndex={setting ? this.getSettingsPanes().findIndex(p => p.name === setting) : 0}
                        onTabChange={(_, data) => {
                            if (this.getSettingsPanes()[data.activeIndex].name) this.setActiveTab(data.activeIndex);
                        }}
                    />
                </Container>
            </>
        );
    }
}

Settings.propTypes = {
    projectId: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const TranslatedSettings = withTranslation()(Settings)
export default connect(mapStateToProps)(TranslatedSettings);
