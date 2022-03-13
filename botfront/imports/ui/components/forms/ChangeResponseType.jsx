import { Dropdown, Confirm, Button } from 'semantic-ui-react';
import React, { useContext, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { defaultTemplate } from '../../../lib/botResponse.utils';
import { ProjectContext } from '../../layouts/context';
import { can } from '../../../lib/scopes';

const ChangeResponseType = (props) => {
    const {
        name, currentResponseType, projectId,
    } = props;
    const [selectedType, setSelectedType] = useState();

    const { upsertResponse } = useContext(ProjectContext);

    const options = [
        { value: 'TextPayload', text: 'texto' },
        { value: 'QuickRepliesPayload', text: 'resposta rápida' },
        { value: 'TextWithButtonsPayload', text: 'botões' },
        { value: 'CarouselPayload', text: 'carrosel' },
        { value: 'CustomPayload', text: 'personalizado' },
    ];
    
    const handleChangeResponseType = () => {
        upsertResponse(name, { payload: defaultTemplate(selectedType) }, 0);
        setSelectedType(null);
    };

    const handleSelectType = (value) => {
        if (value === currentResponseType) return;
        setSelectedType(value);
    };

    if (!can('responses:w', projectId)) return (<></>);

    return (
        <>
            <Dropdown
                data-cy='change-response-type'
                icon=''
                className='change-response-type'
                text='Alterar tipo de resposta'
                onChange={handleSelectType}
            >
                <Dropdown.Menu>
                    {options.map(option => (
                        <Dropdown.Item
                            onClick={() => handleSelectType(option.value)}
                            active={currentResponseType === option.value}
                        >
                            {option.text}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
            <Confirm
                open={!!selectedType}
                header='Alerta!'
                content='Tem certeza de que quer alterar o tipo de resposta? A resposta atual será eliminada.'
                onConfirm={handleChangeResponseType}
                onCancel={() => setSelectedType(null)}
                confirmButton={
                    <Button color='blue' data-cy='confirm-response-type-change'>Ok</Button>
                }
            />
        </>
    );
};

ChangeResponseType.propTypes = {
    name: PropTypes.string.isRequired,
    currentResponseType: PropTypes.string,
    projectId: PropTypes.string.isRequired,
};

ChangeResponseType.defaultProps = {
    currentResponseType: '',
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ChangeResponseType);
