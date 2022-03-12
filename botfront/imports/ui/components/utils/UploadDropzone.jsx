import React, { useState, useRef } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDrop } from 'react-dnd-cjs';
import {
    Message, Icon, Button, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Loading } from './Utils';

export default function UploadDropzone(props) {
    const {
        onDropped, accept: acceptString = '', onError, successMessage, success, loading, binary, maxSizeInMb,
    } = props;
    const [processing, setProcessing] = useState(false);
    const fileField = useRef();

    const handleError = (string) => {
        setProcessing(false);
        return onError(string);
    };

    const loadFiles = (files) => {
        setProcessing(true);

        const accept = acceptString.split(/,\s*/);
        let acceptedFiles = files.filter(f => accept.includes(f.type) || accept.some(t => f.name.match(new RegExp(`${t}$`))));
        let rejectedFiles = files.filter(f => !acceptedFiles.includes(f));
        if (!acceptString) {
            acceptedFiles = files;
            rejectedFiles = [];
        }

        if (!acceptedFiles.length && !rejectedFiles.length) return handleError('Desculpe, não consegui ler o seu arquivo');
        if (rejectedFiles.length) return handleError(`${rejectedFiles[0].name} não é do tipo: ${accept}`);
        if (acceptedFiles.length > 1) return handleError('Por favor, carregue apenas um arquivo');
        if (acceptedFiles[0].size > maxSizeInMb * 1000000) return handleError(`Seu arquivo não deve exceder ${maxSizeInMb}Mb.`);

        const file = acceptedFiles[0];

        const reader = new FileReader();
        reader.onload = () => {
            setProcessing(false);
            try {
                onDropped(reader.result, file);
            } catch (e) {
                throw e;
            }
        };

        reader.onabort = () => handleError('a leitura do arquivo foi cancelada');
        reader.onerror = () => handleError('a leitura do arquivo falhou');
        return binary ? reader.readAsBinaryString(file) : reader.readAsText(file);
    };

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: [NativeTypes.FILE],
        drop: item => loadFiles(Array.from(item.files)),
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <Loading loading={loading || processing}>
            {!success ? (
                <Segment className={`import-box ${canDrop && isOver ? 'upload-target' : ''}`}>
                    <div ref={drop} className='align-center' data-cy='upload-dropzone'>
                        <Icon name='file' size='huge' color='grey' style={{ marginBottom: '8px' }} />
                        <input
                            type='file'
                            ref={fileField}
                            style={{ display: 'none' }}
                            onChange={e => loadFiles(Array.from(e.target.files))}
                        />
                        <Button
                            primary
                            basic
                            content='Carregar arquivo'
                            size='small'
                            onClick={() => fileField.current.click()}
                        />
                        <span className='small grey'>ou solte um arquvi para carregar</span>
                    </div>
                </Segment>
            ) : (
                <Message
                    positive
                    header='Successo!'
                    icon='check circle'
                    content={successMessage}
                />
            )}
        </Loading>
    );
}

UploadDropzone.propTypes = {
    onDropped: PropTypes.func.isRequired,
    accept: PropTypes.string.isRequired,
    onError: PropTypes.func,
    successMessage: PropTypes.string,
    success: PropTypes.bool,
    loading: PropTypes.bool,
    binary: PropTypes.bool,
    maxSizeInMb: PropTypes.number,
};

UploadDropzone.defaultProps = {
    successMessage: 'Seu arquivo está pronto!',
    success: false,
    loading: false,
    binary: true,
    onError: console.log,
    maxSizeInMb: 2,
};
