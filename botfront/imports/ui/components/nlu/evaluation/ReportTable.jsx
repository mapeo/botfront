import React from 'react';
import PropTypes from 'prop-types';
import matchSorter from 'match-sorter';
import ReactTable from 'react-table-v6';
import { Popup, Icon } from 'semantic-ui-react';

export default function ReportTable(props) {
    const { labelType } = props;

    const getReportData = () => {
        const { report } = props;
        if (!report) return [];
        return Object.keys(report).reduce((acc, key) => {
            if (['micro avg', 'macro avg', 'weighted avg', 'accuracy'].includes(key)) return acc;
            return [...acc, { [labelType]: key, ...report[key] }];
        }, []);
    };

    const getReportColumns = () => [
        {
            accessor: labelType,
            Header: labelType.charAt(0).toUpperCase() + labelType.slice(1),
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [labelType] }),
            className: 'left',
            filterAll: true,
        },
        {
            accessor: 'f1-score',
            Header: () => (
                <div>
                    F1-Score{' '}
                    <Popup
                        trigger={<Icon name='question circle' color='grey' />}
                        content='Uma medida geral da qualidade do seu modelo com base na precisão e exatidão'
                    />
                </div>
            ),
            filterable: false,
            width: 100,
        },
        {
            accessor: 'precision',
            Header: () => (
                <div>
                    Precisão{' '}
                    <Popup
                        trigger={<Icon name='question circle' color='grey' />}
                        content='Em 100 previsões de etiqueta, quantas foram realmente rotuladas como tal no conjunto de teste'
                    />
                </div>
            ),
            filterable: false,
            width: 100,
        },
        {
            accessor: 'recall',
            Header: () => (
                <div>
                    Chamada{' '}
                    <Popup
                        trigger={<Icon name='question circle' color='grey' />}
                        content='Em 100 casos de etiqueta em conjunto de teste, quantos foram realmente previstos'
                    />
                </div>
            ),
            filterable: false,
            width: 100,
        },
        {
            accessor: 'support',
            Header: () => (
                <div>
                    Suporte{' '}
                    <Popup
                        trigger={<Icon name='question circle' color='grey' />}
                        content='O número de exemplos para essa etiqueta'
                    />
                </div>
            ),
            filterable: false,
            width: 100,
        },
    ];

    return (
        <ReactTable
            data={getReportData()}
            filterable
            columns={getReportColumns()}
            minRows={1}
            SubComponent={null}
        />
    );
}

ReportTable.propTypes = {
    report: PropTypes.object.isRequired,
    labelType: PropTypes.string.isRequired,
};
