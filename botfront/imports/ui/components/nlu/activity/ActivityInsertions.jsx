import React, { useState, useContext } from 'react';
import {
    Button,
    Form,
    Message,
    TextArea,
    Tab,
} from 'semantic-ui-react';
import { upsertActivity as upsertActivityMutation } from './mutations';
import apolloClient from '../../../../startup/client/apollo';
import { ProjectContext } from '../../../layouts/context';
import { cleanDucklingFromExamples } from '../../../../lib/utils';

export async function populateActivity(instance, examples, projectId, language, callback) {
    return Meteor.call('rasa.parse', instance, examples, async (err, activity) => {
        if (err) return;
        const cleanedActivity = cleanDucklingFromExamples(Array.isArray(activity) ? activity : [activity]);
        const data = cleanedActivity.map(a => ({
            text: a.text,
            intent: (a.intent && a.intent.name) || null,
            confidence: (a.intent && a.intent.confidence) || null,
            entities: a.entities.reduce((acc, cur) => [...acc, {
                entity: cur.entity,
                value: `${cur.value}`,
                start: cur.start,
                end: cur.end,
                extractor: cur.extractor,
            }], []),
        }));

        await apolloClient.mutate({ mutation: upsertActivityMutation, variables: { projectId, language, data } });
        if (callback) callback();
    });
}

export default function ActivityInsertions() {
    const {
        language,
        project: { _id: projectId },
        instance,
    } = useContext(ProjectContext);
    const MAX_LINES = 50;
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const onTextChanged = (e, { value }) => setText(value.split('\n').slice(0, MAX_LINES).join('\n'));

    const saveExamples = () => {
        setLoading(true);
        
        const examples = text.split('\n')
            .filter(t => !t.match(/^\s*$/))
            .map(t => ({ text: t, lang: language }));
        try {
            populateActivity(instance, examples, projectId, language, () => { setText(''); setLoading(false); });
        } catch (e) { setLoading(false); }
    };

    return (
        <Tab.Pane>
            <Message info content='Adicione os enunciados abaixo (um por linha, 50 no máximo). Ao clicar em Adicionar Enunciados, eles serão processados ​​e a saída será mostrada na aba Novos Enunciados' />
            <br />
            <Form>
                <TextArea
                    rows={15}
                    value={text}
                    disabled={loading}
                    onChange={onTextChanged}
                />
                <br />
                <br />
                <Button loading={loading} onClick={saveExamples} disabled={!text || loading}>Adicionar Enunciados</Button>
            </Form>
        </Tab.Pane>
    );
}

ActivityInsertions.propTypes = {};
