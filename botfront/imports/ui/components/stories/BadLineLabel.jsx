import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';

const BadLineLabel = (props) => {
    const { lineMd, lineIndex } = props;
    return (
        <Popup
            on='click'
            trigger={(
                <div className='label-container black'>
                    <div>má ligação</div>
                    <div>
                        {lineMd}
                    </div>
                </div>
            )}
            header={`Bad line on line ${lineIndex}`}
            content={<p>Por favor, fixe esta linha no modo YAML</p>}
        />
    );
};

BadLineLabel.propTypes = {
    lineMd: PropTypes.string,
    lineIndex: PropTypes.number.isRequired,
};

BadLineLabel.defaultProps = {
    lineMd: '',
};

export default BadLineLabel;
