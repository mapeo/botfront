import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { wrapMeteorCallback } from '../utils/Errors';
import LookupTable from './LookupTable';
import InlineSearch from '../utils/InlineSearch';
import MinScoreEdit from './MinScoreEdit';
import { can } from '../../../lib/scopes';
import { withTranslation } from 'react-i18next';

function ModeEdit({ gazette, onEdit }) {
    function onUpdateText(value, callback) {
        onEdit({ ...gazette, mode: value }, callback);
    }

    const data = ['ratio', 'partial_ratio', 'token_sort_ratio', 'token_set_ratio'];

    return (
        <InlineSearch text={gazette.mode} data={data} onUpdateText={onUpdateText} />
    );
}

ModeEdit.propTypes = {
    gazette: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
};

class GazetteEditor extends React.Component {
    onItemChanged = (gazette, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.upsertEntityGazette', model._id, gazette, wrapMeteorCallback(callback));
    };

    onItemDeleted = (gazette, callback) => {
        const { model } = this.props;
        Meteor.call('nlu.deleteEntityGazette', model._id, gazette._id, wrapMeteorCallback(callback));
    };

    extraColumns() {
        const { projectId, t } = this.props;
        return [
            {
                id: 'mode',
                accessor: e => e,
                Header: t('mode'),
                Cell: (props) => {
                    if (can('nlu-data:w', projectId)) {
                        return (
                            <div>
                                <ModeEdit gazette={props.value} onEdit={this.onItemChanged} />
                            </div>
                        );
                    }
                    return <span>{props.value.mode}</span>;
                },
                width: 130,
                filterable: false,
            },
            {
                id: 'min_score',
                accessor: e => e,
                Header: t('mins'),
                Cell: (props) => {
                    if (can('nlu-data:w', projectId)) {
                        return <MinScoreEdit gazette={props.value} onEdit={this.onItemChanged} />;
                    }
                    return <span>{props.value.min_score}</span>;
                },
                width: 100,
                filterable: false,
            },
        ];
    }

    render() {
        const { projectId, model, t } = this.props;
        return (
            <LookupTable
                data={model.training_data.fuzzy_gazette}
                keyHeader={t('value')}
                keyAttribute='value'
                listHeader='Gazette'
                listAttribute='gazette'
                extraColumns={this.extraColumns()}
                onItemChanged={this.onItemChanged}
                onItemDeleted={this.onItemDeleted}
                valuePlaceholder={t('en')}
                listPlaceholder={t('match')}
                projectId={projectId}
            />
        );
    }
}

GazetteEditor.propTypes = {
    model: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
};

const TranslatedGazetteEditor = withTranslation()(GazetteEditor)

export default withTracker(props => ({
    model: props.model,
}))(TranslatedGazetteEditor);
