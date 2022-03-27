/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Menu, Divider } from 'semantic-ui-react';
import { Link } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import { Projects } from '../../../api/project/project.collection';
import ProjectsDropdown from './ProjectsDropdown';
import { can, isUserPermissionGlobal } from '../../../lib/scopes';
import Can from '../roles/Can';

import { GlobalSettings } from '../../../api/globalSettings/globalSettings.collection';
import { withTranslation } from 'react-i18next';

const packageJson = require('/package.json');

class ProjectSidebar extends React.Component {
    render() {
        const {
            projectName, projectId, handleChangeProject, settingsReady, settings, t
        } = this.props;

        const canViewProjectsTab = can('projects:r', projectId)
            || can('export:x', projectId)
            || can('import:x', projectId)
            || can('git-credentials:r', projectId);

        return (
            <DocumentTitle title={projectName}>
                <Menu vertical inverted pointing className='project-menu' data-cy='project-menu'>
                    <Menu.Item>
                        <Menu.Header style={{ marginBottom: '20px' }}>{t('projec')}</Menu.Header>
                        <ProjectsDropdown currentProjectId={projectId} onProjectChange={handleChangeProject} />
                    </Menu.Item>
                    <Can I='stories:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/dialogue`}>
                            <Menu.Item name={t('dialogue')} icon='book' data-cy='dialogue-sidebar-link' />
                        </Link>
                    </Can>
                    <Can I='nlu-data:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/nlu/models`}>
                            <Menu.Item name='NLU' icon='grid layout' data-cy='nlu-sidebar-link' />
                        </Link>
                    </Can>
                    <Can I='incoming:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/incoming`}>
                            <Menu.Item name={t('incoming')} icon='inbox' data-cy='incoming-sidebar-link' />
                        </Link>
                    </Can>
                    <Can I='responses:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/responses`}>
                            <Menu.Item name={t('responses')} icon='comment' />
                        </Link>
                    </Can>
                    <Can I='analytics:r' projectId={projectId}>
                        <Link to={`/project/${projectId}/analytics`}>
                            <Menu.Item name={t('analytics')} icon='chart line' />
                        </Link>
                    </Can>
                    {canViewProjectsTab && (
                        <Link to={`/project/${projectId}/settings`}>
                            <Menu.Item name={t('settings')} icon='setting' data-cy='settings-sidebar-link' />
                        </Link>
                    )}
                    <a href={settingsReady ? settings.settings.public.docUrl : ''} target='_blank' rel='noopener noreferrer'>
                        <Menu.Item name={t('documentation')} icon='question' />
                    </a>
                    <Divider inverted />
                    {(can('roles:r', { anyScope: true })
                    || can('users:r', { anyScope: true })
                    || can('global-settings:r', { anyScope: true })
                    // we need to check if there is not scope for this 'projects:r, because without scope it can create/edit projects
                    || isUserPermissionGlobal(Meteor.userId(), 'projects:r')) && (
                        <Link to='/admin/'>
                            <Menu.Item name={t('adm')} icon='key' />
                        </Link>
                    )}
                    <Link to='/login'>
                        <Menu.Item data-cy='signout' name={t('singout')} icon='sign-out' />
                    </Link>
                    <span className='force-bottom'>{packageJson.version}</span>
                </Menu>
            </DocumentTitle>
        );
    }
}

ProjectSidebar.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    handleChangeProject: PropTypes.func.isRequired,
    settingsReady: PropTypes.bool.isRequired,
    settings: PropTypes.object,
};

ProjectSidebar.defaultProps = {
    settings: null,
};

const ProjectSidebarContainer = withTracker((props) => {
    const { projectId } = props;
    const settingsHandler = Meteor.subscribe('settings');
    const settings = GlobalSettings.findOne({}, { fields: { 'settings.public.docUrl': 1 } });
    const currentProject = Projects.find({ _id: projectId }).fetch();
    const projectName = currentProject.length > 0 ? `${currentProject[0].name}` : 'Botfront.';

    return {
        projectName,
        settingsReady: settingsHandler.ready(),
        settings,
    };
})(ProjectSidebar);

const TranslatedProjectSideBarContainer = withTranslation()(ProjectSidebarContainer)

export default TranslatedProjectSideBarContainer;
