import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import {
    Button, Confirm, Icon, Message, Tab,
} from 'semantic-ui-react';
import 'brace/mode/json';
import 'brace/theme/github';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { ProjectContext } from '../../../layouts/context';
import { wrapMeteorCallback } from '../../utils/Errors';
import { setWorkingLanguage } from '../../../store/actions/actions';
import { GET_EXAMPLE_COUNT } from './graphql';

class DeleteModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            backupDownloaded: false,
            confirmOpen: false,
        };
    }

    onCancel = () => {
        this.setState(this.getInitialState());
    };

    onConfirm = () => {
        const { projectId, language, changeWorkingLanguage } = this.props;
        const { projectLanguages } = this.context;
        const { value: fallbackLang } = projectLanguages.find(({ value }) => value !== language) || {};
        Meteor.call(
            'nlu.remove',
            projectId,
            language,
            wrapMeteorCallback(() => {
                changeWorkingLanguage(fallbackLang);
                this.setState({ confirmOpen: false });
            }, 'Modelo deletado!'),
        );
    };

    cannotDelete = () => {
        const {
            project: { defaultLanguage },
            language,
        } = this.context;
        return language === defaultLanguage;
    };

    downloadModelData = () => {
        if (window.Cypress) {
            this.setState({ backupDownloaded: true });
            return;
        }
        const { language, projectId } = this.props;
        Meteor.call(
            'rasa.getTrainingPayload',
            projectId,
            { language },
            wrapMeteorCallback((_, res) => {
                const { [language]: data } = res.nlu;
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                const filename = `${projectId.toLowerCase()}-${language}-${moment().toISOString()}.json`;
                saveAs(blob, filename);
                this.setState({ backupDownloaded: true });
            }),
        );
    };

    renderCannotDeleteMessage = (language) => {
        if (this.cannotDelete()) {
            return (
                <Message
                    header='O idioma padrão não pode ser deletado'
                    icon='warning'
                    content={
                        'Você não pode deletar o idioma padrão. Para deletar esse idioma, altere o idioma padão do projeto.'
                    }
                    warning
                />
            );
        }
        return (
            <Message
                negative
                header={`Todos os ${language} dados de seu modelo serão deletados!`}
                icon='warning circle'
                content='Por favor, use o botão abaixo para baixar um backup de seus dados antes de continuar.'
            />
        );
    };

    static contextType = ProjectContext;

    render() {
        const { backupDownloaded, confirmOpen } = this.state;
        const { language, examples } = this.props;
        const { projectLanguages } = this.context;
        const { text: languageName } = projectLanguages.find(
            lang => lang.value === language,
        );
        return (
            <Tab.Pane>
                <Confirm
                    open={confirmOpen}
                    header={`Deletar dado ${languageName} de seu modelo? (${examples} examplos)`}
                    content='Isso não pode ser desfeito!'
                    onCancel={this.onCancel}
                    onConfirm={this.onConfirm}
                />
                {!backupDownloaded && (
                    <div>
                        {this.renderCannotDeleteMessage(languageName)}
                        <br />
                        <Button
                            positive
                            onClick={this.downloadModelData}
                            className='dowload-model-backup-button'
                            data-cy='download-backup'
                        >
                            <Icon name='download' />
                            Backup {languageName} data of your model
                        </Button>
                    </div>
                )}
                {backupDownloaded && (
                    <Message success icon='check circle' content='Backup baixado' />
                )}
                <br />
                <br />
                {!this.cannotDelete() && (
                    <Button
                        className='delete-model-button'
                        type='submit'
                        onClick={() => this.setState({ confirmOpen: true })}
                        negative
                        disabled={!backupDownloaded || this.cannotDelete()}
                    >
                        <Icon name='trash' />
                        Deletar dado <strong>{languageName}</strong> de seu modelo
                    </Button>
                )}
            </Tab.Pane>
        );
    }
}

DeleteModel.propTypes = {
    examples: PropTypes.number,
    language: PropTypes.string.isRequired,
    changeWorkingLanguage: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
};

DeleteModel.defaultProps = {
    examples: 0,
};

const DeleteModelWithTracker = withTracker((props) => {
    const { projectId, workingLanguage: language } = props;
    const { data } = useQuery(GET_EXAMPLE_COUNT, { variables: { projectId, language } });
    const { totalLength: examples } = data?.examples?.pageInfo || {};
    return { examples, language };
})(DeleteModel);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeleteModelWithTracker);
