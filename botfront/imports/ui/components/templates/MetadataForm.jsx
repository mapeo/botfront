/* THIS FILE SHOULD NOT BE EDITED ON EE */
import React from 'react';
import {
    AutoForm,
} from 'uniforms-semantic';
import ToggleField from '../common/ToggleField';
import ButtonSelectField from '../form_fields/ButtonSelectField';


// force open affect force close and vice versa
export class AutoFormMetadata extends AutoForm {
    onChange(key, value) {
        if (key === 'forceOpen') {
            super.onChange('forceOpen', value);
            if (value) super.onChange('forceClose', false);
            return;
        }
        if (key === 'forceClose') {
            super.onChange('forceClose', value);
            if (value) super.onChange('forceOpen', false);
            return;
        }
        super.onChange(key, value);
    }
}


export const basicSchemaString = `
        type ResponseMetadata {
            linkTarget: String!
            userInput:  String!
            forceOpen: Boolean!
            forceClose: Boolean!
        }`;

export const defaultModel = {
    linkTarget: '_blank',
    userInput: 'show',
    forceOpen: false,
    forceClose: false,
};

export const schemaData = {
    linkTarget: {
        label: 'Onde os links devem ser abertos?',
        defaultValue: '_blank',
        allowedValues: ['_blank', '_self'],
        options: [
            { text: 'Aba atual', value: '_self', description: 'Abra o link na aba atual' },
            { text: 'Nova aba', value: '_blank', description: 'Abra o link em uma nova aba' },
        ],
    },
    userInput: {
        label: 'Como o campo de entrada de dados do usuário deve ser apresentado?',
        defaultValue: 'show',
        allowedValues: ['show', 'hide', 'disable'],
        options: [
            { text: 'Exibir', value: 'show', description: 'Exibir o campo de entrada (padrão)' },
            { text: 'Ocultar', value: 'hide', description: 'O campo de entrada será ocultado' },
            { text: 'Desabilitar', value: 'disable', description: 'O campo de entrada será cinzento sombreado e não terá interação' },
        ],
    },
    forceOpen: {
        label: 'Forçar o widget do chat a abrir? (A mensagem aparecerá como uma dica de ferramenta se o widget estiver fechado)',
        defaultValue: false,
    },
    forceClose: {
        label: 'Forçar o widget do chat a fechar? (A mensagem aparecerá como uma dica de ferramenta)',
        defaultValue: false,
    },
};

export const panes = [
    {
        menuItem: 'Geral',
        render: () => (
            <>
                <ButtonSelectField name='linkTarget' data-cy='links-target' />
                <ButtonSelectField name='userInput' />
                <ToggleField
                    name='forceOpen'
                    className='toggle'
                    data-cy='toggle-force-open'
                />
                <ToggleField
                    name='forceClose'
                    className='toggle'
                />
            </>
        ),
    },
];
