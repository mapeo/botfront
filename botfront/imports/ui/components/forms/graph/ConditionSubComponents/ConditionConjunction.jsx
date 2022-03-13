import React from 'react';
import PropTypes from 'prop-types';
import ToggleButtonGroup from '../../../common/ToggleButtonGroup';

const ConditionConjunction = (props) => {
    const {
        selectedConjunction, not, setNot, setConjunction,
    } = props;

    return (
        <div className='conjunction-container'>
            <ToggleButtonGroup
                className='condition-conjunction-buttons'
                options={[
                    { value: 'NOT', text: 'Não' },
                ]}
                onChange={() => setNot(!not)}
                value={{
                    NOT: not,
                }}
                compact
            />
            <ToggleButtonGroup
                className='condition-conjunction-buttons'
                options={[
                    { value: 'AND', text: 'E' },
                    { value: 'OR', text: 'Ou' },
                ]}
                onChange={conjunction => setConjunction(conjunction)}
                optionsAreExclusive
                value={selectedConjunction}
                compact
            />
        </div>
    );
};

ConditionConjunction.propTypes = {
    not: PropTypes.bool,
    selectedConjunction: PropTypes.string,
    setConjunction: PropTypes.func.isRequired,
    setNot: PropTypes.func.isRequired,
};

ConditionConjunction.defaultProps = {
    not: false,
    selectedConjunction: 'AND',
};
export default ConditionConjunction;
