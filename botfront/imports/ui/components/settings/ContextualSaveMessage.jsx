import React from 'react';

export default ({ selectedEnvironment }) => {
    if (selectedEnvironment === 'development') {
        return <>Execute <b>botfront restart rasa</b> da sua paste de projeto{'\''} para aplicar as mudanças.</>;
    }
    if (selectedEnvironment === 'production') {
        return <>Essas alterações serão refletidas em seu ambiente de produção na próxima vez que você implantar.</>;
    }
    return <></>;
};
