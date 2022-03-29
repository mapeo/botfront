import {
    Icon, Input, Button, Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import { setStoryMode, setStoriesCurrent } from '../../store/actions/actions';
import { Slots } from '../../../api/slots/slots.collection';
import { ConversationOptionsContext } from './Context';
import { formNameIsValid } from '../../../lib/client.safe.utils';
import { tooltipWrapper } from '../utils/Utils';
import { withTranslation } from 'react-i18next';

class StoryGroupNavigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addMode: false,
            newItemName: '',
            editing: -1,
            itemName: '',
        };
    }

    handleChangeNewItemName = (_, data) => {
        this.setState({ newItemName: data.value });
    };

    handleKeyDownInput = (event, element) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            this.submitTitleInput(element);
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            this.resetTitleInput();
        }
    };

    resetTitleInput = () => {
        this.resetAddItem();
        this.resetRenameItem();
    };

    submitTitleInput = (element) => {
        const {
            editing, newItemName, itemName,
        } = this.state;
        const {
            addGroup, updateGroup,
        } = this.props;
        if (editing === -1 && !!newItemName) {
            addGroup({ name: newItemName });
            this.resetAddItem();
            return;
        }
        if (editing !== -1 && !!itemName) {
            updateGroup({ ...element, name: itemName });
            this.setState({ editing: -1 });
            return;
        }
        this.resetRenameItem();
        this.resetAddItem();
    };

    resetAddItem = () => {
        this.setState({ addMode: false, newItemName: '' });
    };

    resetRenameItem = () => {
        this.setState({ editing: -1 });
    };


    renderNavigation = () => {
        const {
            modals, storyMode, onSwitchStoryMode, t, allowAddition,
        } = this.props;
        return (
            <div className='navigation'>
                <Button.Group fluid>
                    {tooltipWrapper(
                        <Button
                            icon='add'
                            className='icon'
                            data-cy='add-item'
                            disabled={!allowAddition}
                            style={{ textAlign: 'center' }}
                            onClick={() => this.setState({ addMode: true })}
                        />,
                        t('cg'),
                    )}
                    {tooltipWrapper(
                        <Button
                            content='Slots'
                            onClick={() => modals.setSlotsModal(true)}
                            data-cy='slots-modal'
                        />,
                        t('ms'),
                    )}
                    {tooltipWrapper(
                        <Button
                            content={t('policies')}
                            onClick={() => modals.setPoliciesModal(true)}
                            data-cy='policies-modal'
                        />,
                        t('editp'),
                    )}
                    {tooltipWrapper(
                        <Button
                            data-cy={storyMode === 'visual' ? 'toggle-yaml' : 'toggle-visual'}
                            icon
                            onClick={() => onSwitchStoryMode(storyMode === 'visual' ? 'yaml' : 'visual')}
                        >
                            <Icon name={storyMode === 'visual' ? 'code' : 'commenting'} />
                        </Button>,
                        storyMode === 'visual' ? t('syaml') : t('svisual'),
                    )}
                </Button.Group>
            </div>
        );
    };

    render() {
        const { allowAddition, t } = this.props;
        const { addMode, newItemName } = this.state;

        return !allowAddition || !addMode
            ? this.renderNavigation()
            : (
                <Popup
                    size='mini'
                    inverted
                    content={<span>{t('fomspan')}</span>}
                    disabled={addMode !== 'form' || formNameIsValid(newItemName)}
                    position='bottom center'
                    open
                    trigger={(
                        <Input
                            placeholder={t('cgn')}
                            onChange={this.handleChangeNewItemName}
                            value={newItemName}
                            onKeyDown={this.handleKeyDownInput}
                            autoFocus
                            onBlur={this.resetAddItem}
                            fluid
                            data-cy='add-item-input'
                            className='navigation'
                        />
                    )}
                />
            );
    }
}

StoryGroupNavigation.propTypes = {
    allowAddition: PropTypes.bool,
    modals: PropTypes.object.isRequired,
    onSwitchStoryMode: PropTypes.func.isRequired,
    storyMode: PropTypes.string.isRequired,
    addGroup: PropTypes.func.isRequired,
    updateGroup: PropTypes.func.isRequired,
    setStoryMenuSelection: PropTypes.func.isRequired,
    upsertForm: PropTypes.func.isRequired,
};

StoryGroupNavigation.defaultProps = {
    allowAddition: false,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    storyMode: state.stories.get('storyMode'),
});

const mapDispatchToProps = {
    onSwitchStoryMode: setStoryMode,
    setStoryMenuSelection: setStoriesCurrent,
};

const TranslatedStoryGroupNavigation = withTranslation()(StoryGroupNavigation)

const BrowserWithState = connect(mapStateToProps, mapDispatchToProps)(TranslatedStoryGroupNavigation);

export default withTracker(props => ({
    ...props,
    slots: Slots.find({}).fetch(),
}))(props => (
    <ConversationOptionsContext.Consumer>
        {value => <BrowserWithState {...props} {...value} />}
    </ConversationOptionsContext.Consumer>
));
