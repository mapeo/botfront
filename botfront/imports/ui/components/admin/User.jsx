import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';

import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { cloneDeep, reduce, find } from 'lodash';
import {
    Button, Confirm, Container, Header, Segment, Grid, Tab,
} from 'semantic-ui-react';
import React from 'react';
import {
    AutoForm,
    AutoField,
    ErrorsField,
    SubmitField,
    ListField,
    ListItemField,
    NestField,
} from 'uniforms-semantic';
import { browserHistory } from 'react-router';

import { UserEditSchema, UserCreateSchema } from '../../../api/user/user.schema';
import { Projects } from '../../../api/project/project.collection';
import { can, getUserScopes } from '../../../lib/scopes';
import { wrapMeteorCallback } from '../utils/Errors';
import SelectField from '../form_fields/SelectField';
import TranslatedChangePassword from './ChangePassword';
import PageMenu from '../utils/PageMenu';
import { withTranslation } from 'react-i18next';

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmOpen: false,
        };
        this.saveUser = this.saveUser.bind(this);
    }

    getUserEmail = () => {
        const { user } = this.props;
        return user.emails[0].address;
    };

    methodCallback = () => wrapMeteorCallback((err) => {
        if (!err) browserHistory.goBack();
    });

    saveUser = (user) => {
        if (user._id) {
            Meteor.call('user.update', user, this.methodCallback());
        } else {
            const { sendEmail } = user;
            Meteor.call('user.create', user, !!sendEmail, this.methodCallback());
        }
    };

    removeUser = (userId) => {
        const options = {};
        Meteor.call('user.remove', userId, options, this.methodCallback());
    }

    renderRoles = () => {
        const { projectOptions, t } = this.props;
        return (
            <ListField name='roles' data-cy='user-roles-field' label={t('roles')}>
                <ListItemField name='$'>
                    <NestField>
                        <Grid columns='equal'>
                            <Grid.Row>
                                <Grid.Column>
                                    <SelectField
                                        name='project'
                                        placeholder={t('selecpro')}
                                        label={t('project')}
                                        options={projectOptions}
                                    />
                                </Grid.Column>
                                <Grid.Column>
                                    <SelectField name='roles' placeholder={t('selecrole')} label={t('roles')}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </NestField>
                </ListItemField>
            </ListField>
        );
    };

    renderPreferredLanguage = () => {
        const { t } = this.props;
        return (
        <SelectField
            name='profile.preferredLanguage'
            placeholder={t('selecprelng')}
            data-cy='preferred-language'
            label = {t('selecprelabel')}
            options={[
                {
                    text: t('eng'),
                    value: 'en',
                    key: 'en',
                },
                {
                    text: t('fren'),
                    value: 'fr',
                    key: 'fr',
                },
            ]}
        />
    )}

    getPanes = () => {
        const { confirmOpen } = this.state;
        const { user, t } = this.props;
        const hasWritePermission = can('users:w', { anyScope: true });
        const panes = [
            {
                menuItem: t('gi'),
                render: () => (
                    <Segment>
                        <AutoForm
                            schema={UserEditSchema}
                            onSubmit={usr => this.saveUser(usr)}
                            model={user}
                            modelTransform={(mode, model) => {
                                const usr = cloneDeep(model);
                                if (['validate', 'submit'].includes(mode)) {
                                    usr.email = model.emails[0].address.trim().toLowerCase();
                                }
                                return usr;
                            }}
                            disabled={!hasWritePermission}
                        >
                            <AutoField name='emails.0.address' label = {t('addr')} />
                            <AutoField name='emails.0.verified' label = {t('verified')}/>
                            <AutoField name='profile.firstName' label = {t('nome')} />
                            <AutoField name='profile.lastName' label = {t('sobrenome')} />
                            {this.renderPreferredLanguage()}
                            {this.renderRoles()}
                            <ErrorsField />
                            {hasWritePermission && <SubmitField data-cy='save-user' />}
                        </AutoForm>
                    </Segment>
                ),
            },
            ...(hasWritePermission
                ? [{
                    menuItem: t('pc'),
                    render: () => (
                        <Segment>
                            <TranslatedChangePassword userId={user._id} />
                        </Segment>
                    ),
                }]
                : []
            ),
        ];

        if (hasWritePermission) {
            panes.push({
                menuItem: t('ud'),
                render: () => (
                    <Segment>
                        <Header content={t('deluser')} />
                        <br />
                        <Button
                            icon='trash'
                            negative
                            content={t('deluser')}
                            onClick={() => this.setState({ confirmOpen: true })}
                        />
                        <Confirm
                            open={confirmOpen}
                            header={`${t('deluser')} ${this.getUserEmail()}`}
                            content={t('undone')}
                            onCancel={() => this.setState({ confirmOpen: false })}
                            onConfirm={() => this.removeUser(user._id)}
                        />
                    </Segment>
                ),
            });
        }

        return panes;
    };

    render() {
        // noinspection JSAnnotator
        const { user, ready, t } = this.props;
        return (
            <>
                <PageMenu icon='users' title={!!user ? t('edituser') : t('newuser')} />
                {ready && (
                    <Container>
                        {!!user ? (
                            <div>
                                <Tab
                                    menu={{ secondary: true, pointing: true }}
                                    panes={this.getPanes()}
                                />
                                {/* <Segment>
                                    <SetPermissions user={user} saveUser={this.saveUser} projects={projects} />
                                </Segment> */}
                            </div>
                        ) : (
                            <Segment>
                                <AutoForm schema={UserCreateSchema} onSubmit={this.saveUser}>
                                    <AutoField name='profile.firstName' label = {t('nome')} />
                                    <AutoField name='profile.lastName' label = {t('sobrenome')} />
                                    {this.renderPreferredLanguage()}
                                    <AutoField name='email' />
                                    {this.renderRoles()}
                                    <AutoField name='sendEmail' label = {t('sendemail')} />
                                    <ErrorsField />
                                    <SubmitField label={t('createu')} className='primary' />
                                </AutoForm>
                            </Segment>
                        )}
                    </Container>
                )}
            </>
        );
    }
}

User.defaultProps = {
    user: null,
};

User.propTypes = {
    user: PropTypes.object,
    ready: PropTypes.bool.isRequired,
    projectOptions: PropTypes.array.isRequired,
};

// TODO test
function prepareRoles(user) {
    if (!user) return null;
    const userRoles = Roles.getRolesForUser(user._id, { anyScope: true, fullObjects: true, onlyAssigned: true });
    const roles = reduce(
        userRoles,
        function(result, value) {
            let rbac = find(result, { project: value.scope });
            
            if (!rbac) {
                rbac = { project: value.scope ? value.scope : 'GLOBAL', roles: [] };
                result.push(rbac);
            }
            rbac.roles.push(value.role._id);
            return result;
        },
        [],
    );
    return Object.assign(user, { roles });
}

const UserContainer = withTracker(({ params }) => {
    const userDataHandler = Meteor.subscribe('userData');
    const projectsHandler = Meteor.subscribe('projects.names');
    const rolesHandler = Meteor.subscribe('roles');
    const ready = [userDataHandler, projectsHandler, rolesHandler].every(h => h.ready());
    const user = prepareRoles(Meteor.users.findOne({ _id: params.user_id }));
    const editUsersScopes = getUserScopes(Meteor.userId(), 'users:r');
    const projectOptions = Projects.find({ _id: { $in: editUsersScopes } }, { fields: { _id: 1, name: 1 } })
        .fetch()
        .map(p => ({ text: p.name, value: p._id }));
    if (can('users:r')) {
        projectOptions.push({ text: 'GLOBAL', value: 'GLOBAL' }); // global role
    }

    return {
        ready,
        user,
        projectOptions,
    };
})(User);

const TranslatedUserContainer = withTranslation()(UserContainer)

export default TranslatedUserContainer;
