import { AutoForm, ErrorsField } from 'uniforms-semantic';
import { Message } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import { can } from '../../../lib/scopes';
import { DefaultDomainSchema } from '../../../api/project/project.schema';
import { Projects } from '../../../api/project/project.collection';
import { wrapMeteorCallback } from '../utils/Errors';
import ChangesSaved from '../utils/ChangesSaved';
import TranslatedSaveButton from '../utils/SaveButton';
import AceField from '../utils/AceField';
import { withTranslation } from 'react-i18next';

class DefaultDomain extends React.Component {
    constructor(props) {
        super(props);
        this.state = { saving: false, saved: false, showConfirmation: false };
    }

    componentWillUnmount() {
        clearTimeout(this.successTimeout);
    }

    onSave = (defaultDomain) => {
        const { projectId } = this.props;
        this.setState({ saving: true, showConfirmation: false });
        clearTimeout(this.successTimeout);
        Meteor.call(
            'project.update',
            { _id: projectId, defaultDomain },
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ saved: true, showConfirmation: true });
                    this.successTimeout = setTimeout(() => {
                        this.setState({ saved: false });
                    }, 2 * 1000);
                }
                this.setState({ saving: false });
            }),
        );
    };

    renderDefaultDomain = () => {
        const { defaultDomain, projectId, t } = this.props;
        const { saved, showConfirmation, saving } = this.state;
        const hasWritePermission = can('projects:w', projectId);
        return (
            <>
                <Message
                    info
                    icon='question circle'
                    content={(
                        <>
                            {t('domaininfo')}
                        </>
                    )}
                />
                <AutoForm
                    disabled={saving || !hasWritePermission}
                    schema={DefaultDomainSchema}
                    model={defaultDomain}
                    onSubmit={this.onSave}
                >
                    <AceField name='content' label={t('dd')} mode='yaml' data-cy='ace-field' />
                    <ErrorsField />
                    {showConfirmation && (
                        <ChangesSaved
                            onDismiss={() => this.setState({ saved: false, showConfirmation: false })}
                            content={(
                                <p>
                                    {t('domaininfo1')}
                                </p>
                            )}
                        />
                    )}
                    {hasWritePermission && <TranslatedSaveButton saved={saved} saving={saving} />}
                </AutoForm>
            </>
        );
    };

    renderLoading = () => <div />;

    render() {
        const { ready } = this.props;
        if (ready) return this.renderDefaultDomain();
        return this.renderLoading();
    }
}

DefaultDomain.propTypes = {
    projectId: PropTypes.string.isRequired,
    defaultDomain: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
};

const DefaultDomainContainer = withTracker(({ projectId }) => {
    const handler = Meteor.subscribe('projects', projectId);
    const { defaultDomain } = Projects.findOne({ _id: projectId }) || { content: '' };

    return {
        ready: handler.ready(),
        defaultDomain,
    };
})(DefaultDomain);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const TranslatedDefaultDomainContainer = withTranslation()(DefaultDomainContainer)

export default connect(mapStateToProps)(TranslatedDefaultDomainContainer);
