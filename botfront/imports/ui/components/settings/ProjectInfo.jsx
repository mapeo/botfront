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
import { withTranslation } from 'react-i18next';

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
            }, 'Changes saved'),
        );
    };

    renderDeleteprojectLanguages = () => (
        <Message
            size='tiny'
            info
            content={(
                <>
                    To remove a language from the project, go to{' '}
                    <strong> NLU &gt; Settings &gt; Delete </strong>.
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
        const { t } = this.props;
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
                        label={t('nome')}
                        className='project-name'
                        data-cy='project-name'
                    />
                    <InfoField
                        name='namespace'
                        label='Namespace'
                        disabled
                    />
                    <Form.Field>
                        <label>{t('lngsupported')}</label>
                        <Dropdown
                            label='Select Languages'
                            name='lang'
                            placeholder='Add languages'
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
                            label={t('deflng')}
                            name='defaultLanguage'
                            options={projectLanguages}
                            className='project-default-language'
                            data-cy='default-langauge-selection'
                        />
                    )}
                   
                    <InfoField
                        name='nluThreshold'
                        label={t('NLUth')}
                        info={t('NLUthinfo')}
                        data-cy='change-nlu-threshold'
                    />
                    <br />
                    {can('resources:r', projectId) && (
                        <>
                            <InfoField
                                name='deploymentEnvironments'
                                label={t('depenv')}
                                info={t('depenvinfo')}
                                data-cy='deployment-environments'
                                disabled={!can('resources:w', projectId)}
                            />
                            <Message
                                size='tiny'
                                info
                                content={t('depenvimes')}
                            />
                        </>
                    )}
                    <AutoField
                        step='0.5'
                        name='timezoneOffset'
                        label={t('timezone')}
                        data-cy='change-timezone-offset'
                    />
                    <br />
                    <ErrorsField />
                    {hasWritePermission && (
                        <SubmitField
                            className='primary save-project-info-button'
                            value={t('savechanges')}
                            data-cy='save-changes'
                        />
                    )}
                </AutoForm>
            </>
        );
    }
}

ProjectInfo.propTypes = {};

const TranslatedPorjectInfo = withTranslation()(ProjectInfo)
export default TranslatedPorjectInfo;
