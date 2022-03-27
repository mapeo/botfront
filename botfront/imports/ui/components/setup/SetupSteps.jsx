/* eslint-disable no-param-reassign */
import { Container, Segment, Step } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { useTranslation, withTranslation } from 'react-i18next';

import { wrapMeteorCallback } from '../utils/Errors';
import Translated from './StepAccount';

class SetupSteps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
        Meteor.call('users.checkEmpty', (err, empty) => {
            if (!empty) {
                const { router } = this.props;
                router.push('/login');
            }
        });
    }

    handleAccountSubmit = (doc) => {
        const { router } = this.props;
        doc.firstName = doc.firstName.trim();
        doc.lastName = doc.lastName.trim();
        doc.email = doc.email.trim();
        doc.password = doc.password.trim();
        this.setState({ loading: true });
        Meteor.call(
            'initialSetup',
            doc,
            wrapMeteorCallback((err) => {
                if (err) {
                    this.setState({ loading: false });
                    throw new Error(err);
                }
                Meteor.loginWithPassword(
                    doc.email,
                    doc.password,
                    wrapMeteorCallback(() => {
                        Promise.all([
                            Meteor.callWithPromise('nlu.chitChatSetup'),
                        ])
                            .then(() => {
                                this.setState({ loading: false });
                                router.push('/admin/projects');
                            })
                            .catch((e) => {
                                this.setState({ loading: false });
                                // eslint-disable-next-line no-console
                                console.log(e);
                            });
                    }),
                );
            }),
        );
    };

    render() {
        const { loading } = this.state;
        const { t } = this.props;
        return (
            <Container>
                <Segment disabled={loading}>
                    <Step.Group fluid size='large'>
                        <Step
                            active
                            title={t('createa')}
                            onClick={this.handleAccountClick}
                            data-cy='account-step'
                        />
                    </Step.Group>
                    <Translated onSubmit={this.handleAccountSubmit} loading={loading} />
                </Segment>
            </Container>
        );
    }
}


SetupSteps.propTypes = {
    router: PropTypes.object.isRequired,
};

const TranslatedSetupSteps = withTranslation()(SetupSteps)
export default TranslatedSetupSteps;
