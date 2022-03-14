import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Popup, Statistic } from 'semantic-ui-react';

export default class KeyMetrics extends React.PureComponent {
    formatStat = (stat) => {
        const toFloat = parseFloat(stat);
        return `${(toFloat * 100).toFixed(2)}%`;
    };

    render() {
        const { f1, precision, accuracy } = this.props;
        const data = [
            {
                label: 'F1-Score',
                value: f1,
                help: 'Uma medida geral da qualidade do seu modelo com base na precisão e exatidão',
            },
            {
                label: 'Precisão',
                value: precision,
                help: 'Em 100 previsões de etiqueta, quantas foram realmente rotuladas como tal no conjunto de teste',
            },
            {
                label: 'Exatidão',
                value: accuracy,
                help: 'Em 100 casos de etiqueta em conjunto de teste, quantos foram realmente previstos',
            },
        ];

        return (
            <div>
                <Statistic.Group widths={data.length}>{
                    data.map((d, index) => (
                        <Statistic key={index}>
                            <Statistic.Label>{d.label} <Popup trigger={<Icon name='question circle' color='grey' />} content={d.help} /></Statistic.Label>
                            <Statistic.Value>{this.formatStat(d.value)}</Statistic.Value>
                        </Statistic>
                    ))
                }
                </Statistic.Group>
            </div>
        );
    }
}

KeyMetrics.propTypes = {
    f1: PropTypes.number.isRequired,
    accuracy: PropTypes.number.isRequired,
    precision: PropTypes.number.isRequired,
};
