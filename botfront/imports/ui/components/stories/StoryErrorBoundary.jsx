import { Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';
import CrashReportButton from '../utils/CrashReportButton';

class StoryErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, reported: false };
    }

    componentDidCatch(...error) {
        this.setState({ error });
    }

    render() {
        const { error, reported } = this.state;
        if (error) {
            return (
                <div className='story-error-wrapper'>
                    <Message
                        icon='warning'
                        header='Desculpe, algo ocorreu errado com o histórico'
                        content={(
                            <>
                                <p>
                                    Por favor, tente atualizar a página. Se o problema
                                    persistir, tente editar o histórico em modo texto.
                                </p>
                                <p>
                                    {reported
                                        ? 'Nós estamos trabalhando nisso!'
                                        : 'Ajude o projeto Botfront relatando o problema.'}
                                </p>
                                <p>
                                    <CrashReportButton
                                        error={error}
                                        reported={reported}
                                        onLoad={rep => this.setState({ reported: rep })}
                                    />
                                </p>
                            </>
                        )}
                        negative
                    />
                </div>
            );
        }

        const { children } = this.props;
        return children;
    }
}

StoryErrorBoundary.propTypes = {
    children: PropTypes.element.isRequired,
};

export default StoryErrorBoundary;
