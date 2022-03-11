import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import LookupTable from './LookupTable';
import { wrapMeteorCallback } from '../utils/Errors';

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
        const { model } = this.props;
        return (
            <LookupTable
                data={model.training_data.regex_features}
                keyAttribute='name'
                keyHeader='Nome'
                listHeader='Regex'
                listAttribute='pattern'
                onItemChanged={this.onItemChanged}
                onItemDeleted={this.onItemDeleted}
                valuePlaceholder='nome'
                listPlaceholder='Insira uma expressão regular'
                multiple={false}
            />
        );
    }
}

RegexFeatures.propTypes = {
    model: PropTypes.object.isRequired,
};

export default withTracker(props => ({
    model: props.model,
}))(RegexFeatures);
