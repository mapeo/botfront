import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import {
    Container, Segment, Header, Button, Confirm, Message,
} from 'semantic-ui-react';
import React from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import {
    AutoField, ErrorsField, SubmitField, AutoForm,
} from 'uniforms-semantic';
import InfoField from '../utils/InfoField';
import { Projects } from '../../../api/project/project.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import PageMenu from '../utils/PageMenu';
import Can from '../roles/Can';
import SelectField from '../nlu/common/SelectLanguage';
import { withTranslation } from 'react-i18next';

class Project extends React.Component {
    constructor(props) {
        super(props);
        this.state = { confirmOpen: false };
    }

    methodCallback = () => wrapMeteorCallback((err) => {
        if (!err) browserHistory.goBack();
    });

    updateProject = (project) => {
        if (project._id) {
            Meteor.call('project.update', project, wrapMeteorCallback((err) => {
                if (!err) {
                    browserHistory.goBack();
                }
            }));
        } else {
            Meteor.call('project.insert', project, wrapMeteorCallback((err, result) => {
                if (!err) {
                    Meteor.callWithPromise(
                        'nlu.insert', result, project.defaultLanguage, // result is the newly created project id
                    );
                    browserHistory.goBack();
                }
            }));
        }
    };

    deleteProject = () => {
        const { project } = this.props;
        Meteor.call('project.delete', project._id, this.methodCallback());
    };

    render() {
        const { project, loading, t } = this.props;
        const { confirmOpen } = this.state;
        const { namespace } = project || {};
        return (
            <>
                <PageMenu icon='sitemap' title={project._id ? project.name : t('newpro')} />
                <Container>
                    {!loading && (
                        <Segment>
                            <AutoForm
                                schema={Projects.simpleSchema()}
                                onSubmit={p => this.updateProject(p)}
                                model={project}
                            >
                                <AutoField name='name' data-cy='project-name' label = {t('nome')}/>
                                <InfoField
                                    name='namespace'
                                    label='Namespace'
                                    data-cy='project-namespace'
                                    info={t('namespaceinfo')}
                                    disabled={!!namespace}
                                />
                                <SelectField name='defaultLanguage' label={null} placeholder={t('seleclng')} />
                                <br />
                               
                                <AutoField name='disabled' data-cy='disable' label = {t('disabled')}/>
                                <ErrorsField />
                                <SubmitField data-cy='submit-field' />
                            </AutoForm>
                        </Segment>
                    )}
                    {!loading && project._id && (
                        <Can I='global-admin'>
                            <Segment>
                                <Header content={t('delpro')} />
                                {!project.disabled && <Message info content={t('delmes')} />}
                                <br />
                                <Button icon='trash' disabled={!project.disabled} negative content={t('delpro')} onClick={() => this.setState({ confirmOpen: true })} data-cy='delete-project' />
                                <Confirm
                                    open={confirmOpen}
                                    header={`${t('delpro')} ${project.name}?`}
                                    content={t('undone')}
                                    onCancel={() => this.setState({ confirmOpen: false })}
                                    onConfirm={() => this.deleteProject()}
                                />
                            </Segment>
                        </Can>
                    )}
                </Container>
            </>
        );
    }
}

Project.defaultProps = {
    project: {},
};

Project.propTypes = {
    loading: PropTypes.bool.isRequired,
    project: PropTypes.object,
};

const ProjectContainer = withTracker(({ params }) => {
    let project = null;
    let loading = true;
    if (params.project_id) {
        const projectsHandle = Meteor.subscribe('projects', params.project_id);
        loading = !projectsHandle.ready();
        [project] = Projects.find(
            { _id: params.project_id },
            {
                fields: {
                    name: 1,
                    namespace: 1,
                    disabled: 1,
                    apiKey: 1,
                    defaultLanguage: 1,
                },
            },
        ).fetch();
    }
    return {
        loading,
        project,
    };
})(Project);

const TranslatedProjectContainer = withTranslation()(ProjectContainer)
export default TranslatedProjectContainer;
