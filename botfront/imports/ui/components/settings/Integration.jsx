import React, { useState, useEffect, useContext } from 'react';
import { safeLoad } from 'js-yaml';
import { useTracker } from 'meteor/react-meteor-data';
import { Header, Divider } from 'semantic-ui-react';
import { ProjectContext } from '../../layouts/context';
import { CorePolicies as Policies } from '../../../api/core_policies';

export default function IntegrationSettings() {
    const {
        project: { _id: projectId },
    } = useContext(ProjectContext);
    const { policiesLoaded, policy } = useTracker(() => {
        const handler = Meteor.subscribe('policies', projectId);
        const { policies } = safeLoad(
            (Policies.findOne({ projectId }) || { policies: 'policies: []' }).policies,
        );
        const handoffPolicy = policies.find(
            p => p.name === 'rasa_addons.core.policies.BotfrontHandoffPolicy',
        );
        return { policiesLoaded: handler.ready(), policy: handoffPolicy };
    }, [projectId]);
    const [links, setLinks] = useState();
    useEffect(() => {
        Meteor.call(
            'getIntegrationLinks',
            projectId,
            (_, res) => { if (res) setLinks(res); },
        );
    }, []);

    const renderSlackButton = () => {
        if (!links || !links.slackLink) return null;
        return (
            <a href={`${links.slackLink}${JSON.stringify({ projectId })}`}>
                <img
                    alt='Add to Slack'
                    height='40'
                    width='139'
                    src='https://platform.slack-edge.com/img/add_to_slack.png'
                    srcSet='https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x'
                />
            </a>
        );
    };

    const renderCurrentlySetUpService = () => {
        if (!policiesLoaded) return null;
        if (!policy) return null;
        const capitalizedServiceName = policy.service.charAt(0).toUpperCase() + policy.service.slice(1);
        return (
            <p>
                Seu projeto Botfront está conectado com{' '}
                <b style={{ fontSize: 'large' }}>{capitalizedServiceName}</b>.{' '}
                Você pode visualizar essas configurações em suas Políticas.
            </p>
        );
    };

    return (
        <div>
            <Header as='h3'>
                Serviço Handoff
                <Header.Subheader>
                    Conecte seu bot a um serviço de terceiros e interaja com seus usuários
                </Header.Subheader>
            </Header>
            {renderCurrentlySetUpService()}
            <Divider />
            {links ? (
                <>
                    <Header as='h4'>
                    Configurar handoff {policy ? 'again' : ''} com
                    </Header>
                    <p>{renderSlackButton()}</p>
                </>
            ) : (
                <i>O administrador não forneceu nenhum serviço conectável.</i>
            )}
        </div>
    );
}

IntegrationSettings.propTypes = {};
