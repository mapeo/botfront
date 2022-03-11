import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';
import { Meteor } from 'meteor/meteor';
import {
    Dropdown, Confirm, Button,
    Loader, Message, Icon,
} from 'semantic-ui-react';
import { ProjectContext } from '../../../layouts/context';
import 'react-s-alert/dist/s-alert-default.css';

import { wrapMeteorCallback } from '../../utils/Errors';

export default class ChitChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chitChatIntents: null,
            notConfiguredError: null,
            confirmOpen: false,
            selectedIntents: [],
        };
    }

    componentDidMount() {
        this.loadChitChatIntents();
    }

    handleIntentSelectorChange = (e, { value }) => {
        this.setState({ selectedIntents: value });
    };

    loadChitChatIntents = () => {
        const { model: { language } } = this.props;

        Meteor.call('nlu.getChitChatIntents', language, (e, intents) => {
            if (e) {
                if (e instanceof ReferenceError) {
                    this.setState({ notConfiguredError: e.message });
                } else {
                    Alert.error(`Não foi possível buscar os objetivos do chit chat: ${JSON.stringify(e.reason)}`, {
                        position: 'top',
                        timeout: 'none',
                    });
                }
            } else {
                this.setState({ chitChatIntents: intents });
            }
        });
    };

    addToTrainingData = () => {
        const { model: { language } } = this.props;
        const { project: { _id: projectId } } = this.context;
        const { selectedIntents } = this.state;
        this.close();

        Meteor.call('nlu.addChitChatToTrainingData', projectId, language, selectedIntents, wrapMeteorCallback(() => {
            this.setState({ selectedIntents: [] });
        }, 'exemplos de chitchat importados para o treinamento de dados.'));
    };

    open = () => this.setState({ confirmOpen: true });

    close = () => this.setState({ confirmOpen: false });

    static contextType = ProjectContext;

    render() {
        const {
            notConfiguredError, chitChatIntents, confirmOpen, selectedIntents,
        } = this.state;
        
        return (
            <div className='glow-box extra-padding no-margin'>
                {notConfiguredError && <Message error content={notConfiguredError} />}
                {chitChatIntents && chitChatIntents.length === 0 && <Message info content="Os objetivos do Chitchat não estão disponíveis no idioma do seu modelo." />}
                {chitChatIntents && chitChatIntents.length > 0 && (
                    <div className='chitchat' style={{ minHeight: 300 }}>
                        {/* minHeight to make sure there is enough space for the dropdown */}
                        <Message info data-cy='chit-chat-message'>
                            <Icon name='lightbulb' size='small' />
                            Os objetivos do Chit chat são objetivos gerais de conversação pré-treinadas. Selecione aqueles que você deseja integrar em seu modelo, adicione e treine novamente.
                        </Message>
                        <br />

                        <Dropdown
                            data-cy='select-chit-chat'
                            placeholder='Selecione os objetivos do chit chat'
                            multiple
                            selection
                            fluid
                            value={selectedIntents}
                            search
                            onChange={this.handleIntentSelectorChange}
                            options={chitChatIntents.map(i => ({ text: i, value: i }))}
                        />
                        <br />
                        <br />
                        <Button
                            primary
                            disabled={selectedIntents.length === 0}
                            content='Adicionar aos treinamentos de dados'
                            onClick={this.open}
                            data-cy='add-chit-chat'
                        />
                        <Confirm
                            header='Adicionar aos treinamentos de dados?'
                            content={`Isso adicionará exemplos de chitchat ao seus treinamentos de dados que correspondem aos seguintes objetivos: ${selectedIntents.join(' ')}`}
                            open={confirmOpen}
                            onCancel={this.close}
                            onConfirm={this.addToTrainingData}
                        />
                    </div>
                )}

                {!chitChatIntents && <Loader active inline='centered' />}
            </div>
        );
    }
}

ChitChat.propTypes = {
    model: PropTypes.object.isRequired,
};
