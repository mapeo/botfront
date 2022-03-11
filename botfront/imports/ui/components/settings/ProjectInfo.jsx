/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import {
    AutoForm,
    SubmitField,
    ErrorsField,
    LongTextField,
    AutoField,
} from 'uniforms-semantic';
import {
    Dropdown, Form, Message, Icon, Segment,
} from 'semantic-ui-react';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { ProjectsSchema } from '../../../api/project/project.schema';
import { ProjectContext } from '../../layouts/context';
import InfoField from '../utils/InfoField';
import { wrapMeteorCallback } from '../utils/Errors';
import SelectField from '../form_fields/SelectField';
import { can } from '../../../lib/scopes';
import { languages } from '../../../lib/languages';
import { Info } from '../common/Info';

class ProjectInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saving: false,
            value: [],
            model: {},
        };
    }

    componentDidMount() {
        const { projectLanguages, project } = this.context;
        this.setState({ value: projectLanguages.map(l => l.value) });
        this.setState({ model: project });
    }

    getOptions = () => {
        const renderOptions = Object.keys(languages).map(code => ({
            text: languages[code].name,
            key: code,
            value: code,
        }));
        return renderOptions;
    };

    renderLabel = (language) => {
        const { projectLanguages } = this.context;
        const isModelExist = projectLanguages.some(l => l.value === language.value);
        const label = {
            color: isModelExist ? 'blue' : 'green',
            content: `${language.text}`,
        };
        if (!isModelExist) return label;
        label.removeIcon = '';
        return label;
    };

    onChange = (e, { value: newValue }) => {
        this.setState({ saving: false, value: newValue });
    };

    createNLUModels = (languageArray, projectId) => {
        const nluInsertArray = languageArray.map(language => Meteor.callWithPromise('nlu.insert', projectId, language));
        Promise.all(nluInsertArray).then(() => {
            this.setState({ saving: false });
        });
    };

    onSave = (project) => {
        const { value } = this.state;
        const { projectLanguages } = this.context;
        const {
            name,
            _id,
            defaultLanguage,
           
            nluThreshold,
            deploymentEnvironments,
            timezoneOffset,
        } = project;
        const notInprojectLanguages = value.filter(
            el => !projectLanguages.some(l => l.value === el),
        );
        this.setState({ saving: true });
        if (deploymentEnvironments && deploymentEnvironments.length === 0) {
            Meteor.call('stories.changeStatus', _id, 'unpublished', 'published');
        }
        Meteor.call(
            'project.update',
            {
                name,
                _id,
                defaultLanguage,
              
                nluThreshold,
                deploymentEnvironments,
                timezoneOffset,
            },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.createNLUModels(notInprojectLanguages, _id);
                }
            }, 'Alterações salvas'),
        );
    };

    renderDeleteprojectLanguages = () => (
        <Message
            size='tiny'
            info
            content={(
                <>
                    Para remover um idioma do projeto, vá para{' '}
                    <strong> NLU &gt; Configurações &gt; Deletar </strong>.
                </>
            )}
        />
    );

    static contextType = ProjectContext;

    render() {
        const {
            projectLanguages,
            project: { _id: projectId },
        } = this.context;
        const { saving, value, model } = this.state;
        const hasWritePermission = can('projects:w', projectId);
        if (model.deploymentEnvironments) {
            model.deploymentEnvironments = model.deploymentEnvironments.filter(env => env !== 'staging');
        }
        const bridge = new SimpleSchema2Bridge(ProjectsSchema);
        return (
            <>
                <AutoForm
                    schema={bridge}
                    model={model}
                    onSubmit={updateProject => this.onSave(updateProject)}
                    disabled={saving || !hasWritePermission}
                >
                    <InfoField
                        name='name'
                        label='Nome'
                        className='project-name'
                        data-cy='project-name'
                    />
                    <InfoField
                        name='namespace'
                        label='Namespace'
                        disabled
                    />
                    <Form.Field>
                        <label>Idiomas suportados</label>
                        <Dropdown
                            label='Selecionar idiomas'
                            name='lang'
                            placeholder='Adicionar idiomas'
                            multiple
                            search
                            value={value}
                            selection
                            onChange={this.onChange}
                            options={this.getOptions()}
                            renderLabel={language => this.renderLabel(language)}
                            data-cy='language-selector'
                            disabled={!hasWritePermission}
                        />
                        {!!projectLanguages.length && this.renderDeleteprojectLanguages()}
                    </Form.Field>
                    {!!projectLanguages.length && (
                        <SelectField
                            name='defaultLanguage'
                            label='Idioma padrão'
                            options={projectLanguages}
                            className='project-default-language'
                            data-cy='default-langauge-selection'
                        />
                    )}
                   
                    <InfoField
                        name='nluThreshold'
                        label='Limite NLU'
                        info='O Botfront exibirá recomendações sobre as declarações recebidas com base nesse limite'
                        data-cy='change-nlu-threshold'
                    />
                    <br />
                    {can('resources:r', projectId) && (
                        <>
                            <InfoField
                                name='deploymentEnvironments'
                                label='Ambientes de implantação'
                                info='O Botfront habilitará ambientes adicionais para seu fluxo de trabalho'
                                data-cy='deployment-environments'
                                disabled={!can('resources:w', projectId)}
                            />
                            <Message
                                size='tiny'
                                info
                                content='Se você remover todos os ambientes, todas as histórias serão publicadas'
                            />
                        </>
                    )}
                    <AutoField
                        step='0.5'
                        name='timezoneOffset'
                        label='Deslocamento de fuso horário em relação a UTC±00:00'
                        data-cy='change-timezone-offset'
                    />
                    <br />
                    <ErrorsField />
                    {hasWritePermission && (
                        <SubmitField
                            className='primary save-project-info-button'
                            value='Salvar alterações'
                            data-cy='save-changes'
                        />
                    )}
                </AutoForm>
            </>
        );
    }
}

ProjectInfo.propTypes = {};

export default ProjectInfo;
