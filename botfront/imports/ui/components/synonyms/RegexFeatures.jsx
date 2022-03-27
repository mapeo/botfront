import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import LookupTable from './LookupTable';
import { wrapMeteorCallback } from '../utils/Errors';
import { withTranslation } from 'react-i18next';

class RegexFeatures extends React.Component {
    onItemChanged = (regexFeature, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.upsertRegexFeature', model._id, regexFeature, wrapMeteorCallback(callback));
    };

    onItemDeleted = (synonym, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.deleteRegexFeature', model._id, synonym._id, wrapMeteorCallback(callback));
    };

    render() {
        const { model, t } = this.props;
        return (
            <LookupTable
                data={model.training_data.regex_features}
                keyAttribute={t('nome')}
                keyHeader={t('nome')}
                listHeader='Regex'
                listAttribute='pattern'
                onItemChanged={this.onItemChanged}
                onItemDeleted={this.onItemDeleted}
                valuePlaceholder='name'
                listPlaceholder={t('ere')}
                multiple={false}
            />
        );
    }
}

RegexFeatures.propTypes = {
    model: PropTypes.object.isRequired,
};

const TranslatedRegexFeatures = withTranslation()(RegexFeatures)

export default withTracker(props => ({
    model: props.model,
}))(TranslatedRegexFeatures);
