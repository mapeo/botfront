import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Icon, Button, Popup,
} from 'semantic-ui-react';
import SettingsPortal from './SettingsPortal';
import { useTranslation } from 'react-i18next';

export const filters = ['includeActions', 'excludeAction', 'includeActions', 'excludeIntents', 'selectedSequence', 'conversationLength', 'limit', 'eventFilter'];
export const conversationTypes = ['userInitiatedConversations', 'triggeredConversations'];

const SettingsMenu = (props) => {
    const {
        settings,
        titleDescription,
        onChangeSettings,
        displayConfigs,
        denominatorLine,
        exportData,
        canExport,
    } = props;

    const { t } = useTranslation();

    const displayTypeHeader = useMemo(() => (
        displayConfigs.some(setting => conversationTypes.includes(setting))
    ), [displayConfigs]);
    const displayFiltersHeader = useMemo(() => (
        displayConfigs.some(setting => filters.includes(setting))
    ), [displayConfigs]);

    const [settingsOpen, setSettingsOpen] = useState();

    const renderCheckOption = (text, setting, value) => (
        <React.Fragment key={setting}>
            <Dropdown.Item
                data-cy={`edit-${setting}`}
                className='toggle-item'
                onClick={() => onChangeSettings({ [setting]: !value })}
                content={<>{text}{value && <Icon name='check' className='card-settings-checkmark' />}</>}
            />
        </React.Fragment>
    );

    const getSettingsPortalProps = (setting) => {
        const values = settings[setting] || [];
        const valueText = `(${values.length})`;
        switch (setting) {
        case 'includeActions':
            return { text: t('ia'), valueText, values };
        case 'excludeActions':
            return { text: t('ea'), valueText, values };
        case 'includeIntents':
            return { text: t('ii'), valueText, values };
        case 'excludeIntents':
            return { text: t('ei'), valueText, values };
        case 'selectedSequence':
            return { text: t('selecseq'), valueText, values };
        case 'conversationLength':
            return {
                text: t('mnu'),
                valueText: settings[setting] ? `: ${settings[setting]}` : '',
                values,
            };
        case 'limit':
            return {
                text: t('dl'),
                valueText: settings[setting] ? `: ${settings[setting]}` : '',
                values: settings[setting],
            };
        case 'eventFilter':
            return {
                text: t('fce'),
                valueText,
                values: { selection: settings[setting] || [], operator: settings.eventFilterOperator || 'or' },
            };
        default:
            return {};
        }
    };

    const renderExtraOptionsLink = (setting) => {
        const { text, valueText, values } = getSettingsPortalProps(setting);
        if (!text) return <React.Fragment key={setting} />;
        return (
            <React.Fragment key={setting}>
                <SettingsPortal
                    text={text}
                    setting={setting}
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen === setting}
                    value={values}
                    onChange={(newVal) => {
                        if (setting === 'eventFilter') {
                            onChangeSettings({ eventFilter: newVal.selection, eventFilterOperator: newVal.operator });
                            return;
                        }
                        onChangeSettings({ [setting]: newVal });
                    }
                    }
                />
                <Dropdown.Item
                    text={`${text}${valueText}`}
                    data-cy={`edit-${setting}`}
                    onClick={() => setSettingsOpen(setting)}
                />
            </React.Fragment>
        );
    };

    return (
        <Dropdown
            trigger={(
                <Button
                    className='export-card-button'
                    icon='ellipsis vertical'
                    basic
                    data-cy='card-ellipsis-menu'
                />
            )}
            basic
        >
            <Dropdown.Menu>
                <Dropdown.Header content={t('appea')} onClick={e => e.stopPropagation()} />
                <Dropdown.Item
                    text={settings.wide ? t('shw') : t('efw')}
                    data-cy='toggle-wide'
                    onClick={() => onChangeSettings({ wide: !settings.wide })}
                />
                <React.Fragment key='edit-description'>
                    <SettingsPortal
                        text={t('ed')}
                        onClose={() => setSettingsOpen(false)}
                        open={settingsOpen === 'description'}
                        values={titleDescription}
                        onChange={newVal => onChangeSettings({ description: newVal })}
                    />
                    <Dropdown.Item
                        text={t('ed')}
                        data-cy='edit-description'
                        onClick={() => setSettingsOpen('description')}
                    />
                </React.Fragment>
                {denominatorLine && (
                    <Dropdown.Item
                        text={settings.showDenominator ? t('hc') : t('sc')}
                        data-cy='toggle-denominator'
                        onClick={() => onChangeSettings({ showDenominator: !settings.showDenominator })}
                    />
                )}
                {displayTypeHeader && <Dropdown.Header content={t('tc')} onClick={e => e.stopPropagation()} /> }
                {displayConfigs.includes('userInitiatedConversations') && renderCheckOption(t('uic'), 'userInitiatedConversations', settings.userInitiatedConversations)}
                {displayConfigs.includes('triggerConversations') && renderCheckOption(t('trc'), 'triggerConversations', settings.triggerConversations)}
                {displayFiltersHeader && <Dropdown.Header content={t('filters')} onClick={e => e.stopPropagation()} />}
                {(displayConfigs || []).map(renderExtraOptionsLink)}
                <Dropdown.Header content='Extras' onClick={e => e.stopPropagation()} />
                <Popup
                    content={t('popcard')}
                    inverted
                    disabled={canExport}
                    trigger={(
                        <Dropdown.Item
                            onClick={e => (canExport ? exportData() : e.stopPropagation())}
                            className={!canExport ? 'disabled-popup-item' : ''}
                            data-cy='export-card'
                        >
                            {t('etc')} (.csv)
                        </Dropdown.Item>
                    )}
                />
            </Dropdown.Menu>
        </Dropdown>
    );
};

SettingsMenu.propTypes = {
    settings: PropTypes.object.isRequired,
    titleDescription: PropTypes.string.isRequired,
    onChangeSettings: PropTypes.func.isRequired,
    displayConfigs: PropTypes.array,
    denominatorLine: PropTypes.bool,
    exportData: PropTypes.func.isRequired,
    canExport: PropTypes.bool,
};

SettingsMenu.defaultProps = {
    displayConfigs: [],
    denominatorLine: false,
    canExport: false,
};

export default SettingsMenu;
