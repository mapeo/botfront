import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Search,
} from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

const BotResponsePopupContent = (props) => {
    const {
        onCreate, trigger, noButtonResponse, limitedSelection, defaultOpen, onClose, disableExisting, trackOpenMenu,
    } = props;
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [closeNext, setCloseNext] = useState(false);
    const [menuOpen, setMenuOpen] = useState();

    useEffect(() => {
        if (closeNext && !modalOpen) onClose();
    }, [closeNext]);

    return (
        <>
            {/* <Modal
                tabIndex={0}
                size='tiny'
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <Modal.Header>Select from existing</Modal.Header>
                <Modal.Content className='bot-responses-modal'>
                    { responses.map(r => (
                        <button
                            type='button'
                            onClick={(e) => { e.preventDefault(); setModalOpen(false); onSelect(r); }}
                            key={r.name}
                        >
                            {r.name}
                        </button>
                    ))}
                </Modal.Content>
            </Modal> */}
            <Dropdown
                trigger={trigger}
                className='dropdown-button-trigger'
                defaultOpen={defaultOpen}
                open={menuOpen}
                onOpen={() => {
                    setMenuOpen(true);
                    trackOpenMenu(() => setMenuOpen(false));
                }}
                onClose={() => {
                    setMenuOpen(false);
                    setCloseNext(true);
                }}
            >
                <Dropdown.Menu className='first-column'>
                    { !disableExisting
                        && (
                            <>
                                <Dropdown.Header>{t('sfe')}</Dropdown.Header>
                                <Dropdown.Item onClick={() => setModalOpen(true)}>
                                    <Search fluid placeholder={t('searchres')} />
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Header>{t('out')}</Dropdown.Header>
                            </>
                        )
                    }
                    <Dropdown.Item onClick={() => onCreate('TextPayload')} data-cy='from-text-template'>{t('txt')}</Dropdown.Item>
                    <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('QuickRepliesPayload')} data-cy='from-qr-template'>{t('bqr')}</Dropdown.Item>
                    <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('CarouselPayload')} data-cy='from-carousel-template'>{t('carousel')}</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('ImagePayload')} data-cy='from-image-template'>{t('img')}</Dropdown.Item>
                    <Dropdown.Item onClick={() => onCreate('CustomPayload')} data-cy='from-custom-template'>{t('cust')}</Dropdown.Item>
                    {!limitedSelection
                        && (
                        <>
                            <Dropdown.Item onClick={() => onCreate('VideoPayload')} data-cy='from-video-template'>{t('vid')}</Dropdown.Item>
                            <Dropdown.Item disabled={noButtonResponse} onClick={() => onCreate('ButtonPayload')} data-cy='from-button-template'>{t('bt')}</Dropdown.Item>
                        </>
                        )
                    }
                </Dropdown.Menu>
            </Dropdown>
        </>
    );
};

BotResponsePopupContent.propTypes = {
    value: PropTypes.string,
    onSelect: PropTypes.func,
    onCreate: PropTypes.func,
    trigger: PropTypes.element.isRequired,
    noButtonResponse: PropTypes.bool,
    limitedSelection: PropTypes.bool,
    defaultOpen: PropTypes.bool,
    onClose: PropTypes.func,
    disableExisting: PropTypes.bool,
    trackOpenMenu: PropTypes.func,
};

BotResponsePopupContent.defaultProps = {
    value: null,
    noButtonResponse: false,
    limitedSelection: false,
    defaultOpen: false,
    disableExisting: false,
    onSelect: () => {},
    onCreate: () => {},
    onClose: () => {},
    trackOpenMenu: () => {},
};

export default BotResponsePopupContent;
