import { Segment, Header, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmPopup = ({
    title, onYes, onNo, description, content, negative,
}) => {
    const { t } = useTranslation();
    return (
        <Segment basic className='confirm-popup' data-cy='confirm-popup'>
            <Header as='h4'>{title}</Header>
            {description}
            {content}
            <div className='popup-buttons'>
                <Button
                    // basic{negative}
                    primary
                    onClick={onNo}
                    size='tiny'
                    data-cy='confirm-no'
                >
                    {t('cancel')}
                </Button>
                <Button
                    primary
                    negative={negative}
                    basic
                    onClick={onYes}
                    size='tiny'
                    data-cy='confirm-yes'
                >
                    {t('confirm')}
                </Button>
            </div>
        </Segment>
    )
};


ConfirmPopup.propTypes = {
    title: PropTypes.string,
    onYes: PropTypes.func,
    description: PropTypes.string,
    content: PropTypes.node,
    onNo: PropTypes.func,
    negative: PropTypes.bool,
};

ConfirmPopup.defaultProps = {
    description: '',
    onYes: () => { },
    onNo: () => { },
    content: null,
    title: '',
    negative: false,
};

export default ConfirmPopup;
