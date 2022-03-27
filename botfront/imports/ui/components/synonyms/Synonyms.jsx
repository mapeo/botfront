import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import LookupTable from './LookupTable';
import { wrapMeteorCallback } from '../utils/Errors';
import { withTranslation } from 'react-i18next';

class SynonymsEditor extends React.Component {
    onItemChanged = (synonym, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.upsertEntitySynonym', model._id, synonym, wrapMeteorCallback(callback));
    };

    onItemDeleted = (synonym, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.deleteEntitySynonym', model._id, synonym._id, wrapMeteorCallback(callback));
    };

    render() {
        const { model, projectId, t } = this.props;
        return (
            <LookupTable
                data={model.training_data.entity_synonyms}
                keyHeader={t('value')}
                keyAttribute='value'
                listHeader={t('synonyms')}
                listAttribute='synonyms'
                onItemChanged={this.onItemChanged}
                onItemDeleted={this.onItemDeleted}
                valuePlaceholder={t('ev')}
                listPlaceholder={t('synon12')}
                projectId={projectId}
            />
        );
    }
}

SynonymsEditor.propTypes = {
    model: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
};

const TranslatedSynonymsEditor = withTranslation()(SynonymsEditor)

export default withTracker(props => ({
    model: props.model,
}))(TranslatedSynonymsEditor);
