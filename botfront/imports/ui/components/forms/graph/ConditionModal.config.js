import { BasicConfig } from 'react-awesome-query-builder';
import React from 'react';
import ConditionInput from './ConditionSubComponents/ConditionInput';
import ConditionDropdown from './ConditionSubComponents/ConditionDropdown';
import ConditionButton from './ConditionSubComponents/ConditionButton';
import ConditionConjunction from './ConditionSubComponents/ConditionConjunction';
import ConditionMultiselect from './ConditionSubComponents/ConditionMultiselect';

export const QbConfig = {
    ...BasicConfig,
    settings: {
        renderField: settings => <ConditionDropdown {...settings} />,
        renderOperator: settings => <ConditionDropdown {...settings} />,
        renderConjs: settings => <ConditionConjunction {...settings} />,
        renderButton: settings => <ConditionButton {...settings} />,
    },
    fields: {},
    operators: {
        is_exactly: {
            label: 'é exatamente',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        is_in: {
            label: 'é um dos',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        contains: {
            label: 'contém',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        longer: {
            label: 'tem uma contagem de caracteres maior do que',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        longer_or_equal: {
            label: 'tem uma contagem de caracteres maior ou igual a',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        shorter: {
            label: 'tem uma contagem de caracteres menor a',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        shorter_or_equal: {
            label: 'tem uma contagem de caracteres menor ou igual a',
            reversedOp: '',
            formatOp: (_, __, value) => (value >= 0 ? value : 0),
        },
        word: {
            label: 'é uma única palavra, sem espaço em branco ou caracteres especiais',
            reversedOp: '',
            formatOp: () => (true),
        },
        starts_with: {
            label: 'inicia com',
            reversedOp: '',
            formatOp: (_, __, value) => value,

        },
        ends_with: {
            label: 'termina com',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        matches: {
            label: 'corresponde a uma expressão regex',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        eq: {
            label: 'é igual a',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        gt: {
            label: 'é maior do que',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        gte: {
            label: 'é maior ou igual a',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        lt: {
            label: 'é menor que',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        lte: {
            label: 'é menor ou igual a',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
        email: {
            label: 'é um email',
            reversedOp: '',
            formatOp: (_, __, value) => value,
        },
    },
    widgets: {
        ...BasicConfig.widgets,
        custom_text: {
            ...BasicConfig.widgets.text,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} className='custom-text' />,
        },
        custom_number: {
            ...BasicConfig.widgets.number,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} inputType='number' className='custom-number' placeholder='Número' />,
        },
        positive_number: {
            ...BasicConfig.widgets.number,
            type: 'custom_text',
            factory: settings => <ConditionInput {...settings} inputType='number' min={0} className='custom-number' placeholder='Número' />,
        },
        custom_multiselect: {
            ...BasicConfig.widgets.multiselect,
            type: 'custom_text',
            factory: settings => <ConditionMultiselect {...settings} className='custom-multiselect' />,
        },
        custom_blank: {
            type: 'custom_text',
            factory: () => <></>,
        },
    },
    types: {
        custom_text: {
            operators: [
                'is_exactly',
                'is_in',
                'contains',
                'longer',
                'longer_or_equal',
                'shorter',
                'shorter_or_equal',
                'word',
                'starts_with',
                'ends_with',
                'matches',
                'eq',
                'gt',
                'gte',
                'gte',
                'lt',
                'lte',
                'email',
            ],
            widgets: {
                custom_text: {
                    operators: [
                        'is_exactly',
                        'contains',
                        'starts_with',
                        'ends_with',
                        'matches',
                    ],
                },
                custom_number: {
                    operators: [
                        'eq',
                        'gt',
                        'gte',
                        'lt',
                        'lte',
                    ],
                },
                custom_multiselect: {
                    widgetProps: {
                        items: [],
                    },
                    operators: [
                        'is_in',
                    ],
                },
                positive_number: {
                    operators: [
                        'longer',
                        'longer_or_equal',
                        'shorter',
                        'shorter_or_equal',
                    ],
                },
                custom_blank: {
                    operators: [
                        'word',
                        'email',
                    ],
                },
            },
        },
    },
};
