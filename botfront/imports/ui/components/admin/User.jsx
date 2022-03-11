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
import ChangePassword from './ChangePassword';
import PageMenu from '../utils/PageMenu';

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
        const { projectOptions } = this.props;
        return (
            <ListField name='roles' data-cy='user-roles-field' label='Papéis'>
                <ListItemField name='$'>
                    <NestField>
                        <Grid columns='equal'>
                            <Grid.Row>
                                <Grid.Column>
                                    <SelectField
                                        name='project'
                                        placeholder='Selecione um projeto'
                                        options={projectOptions}
                                        label='Projeto'
                                    />
                                </Grid.Column>
                                <Grid.Column>
                                    <SelectField name='roles' placeholder='Selecionar papel' label='Papel' />
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </NestField>
                </ListItemField>
            </ListField>
        );
    };

    renderPreferredLanguage = () => (
        <SelectField
            name='profile.preferredLanguage'
            placeholder='Selecione um idioma de sua preferência'
            data-cy='preferred-language'
            label='Idioma preferido'
            options={[
                {
                    text: 'English',
                    value: 'en',
                    key: 'en',
                },
                {
                    text: 'French',
                    value: 'fr',
                    key: 'fr',
                },
            ]}
        />
    )

    getPanes = () => {
        const { confirmOpen } = this.state;
        const { user } = this.props;
        const hasWritePermission = can('users:w', { anyScope: true });
        const panes = [
            {
                menuItem: 'Informações gerais',
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
                            <AutoField name='emails.0.address' label='Email' />
                            <AutoField name='emails.0.verified' label='Verificado' />
                            <AutoField name='profile.firstName' label='Nome' />
                            <AutoField name='profile.lastName' label='Sobrenome' />
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
                    menuItem: 'Mudança de senha',
                    render: () => (
                        <Segment>
                            <ChangePassword userId={user._id} />
                        </Segment>
                    ),
                }]
                : []
            ),
        ];

        if (hasWritePermission) {
            panes.push({
                menuItem: 'Exclusão de usuário',
                render: () => (
                    <Segment>
                        <Header content='Deletar usuário' />
                        <br />
                        <Button
                            icon='trash'
                            negative
                            content='Deletar usuário'
                            onClick={() => this.setState({ confirmOpen: true })}
                        />
                        <Confirm
                            open={confirmOpen}
                            header={`Deletar usuário ${this.getUserEmail()}`}
                            content='Isso não pode ser desfeito!'
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
        const { user, ready } = this.props;
        return (
            <>
                <PageMenu icon='users' title={!!user ? 'Editar usuário' : 'Novo usuário'} />
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
                                    <AutoField name='profile.firstName' label='Nome'/>
                                    <AutoField name='profile.lastName' label='Sobrenome'/>
                                    {this.renderPreferredLanguage()}
                                    <AutoField name='email' />
                                    {this.renderRoles()}
                                    <AutoField name='sendEmail' label='Enviar e-mail' />
                                    <ErrorsField />
                                    <SubmitField label='Criar usuário' className='primary' />
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

export default UserContainer;
