import ReactTable from 'react-table-v6';
import PropTypes from 'prop-types';
import {
    Icon, Label, Tab, Message, Popup,
} from 'semantic-ui-react';
import React from 'react';
import { find, sortBy } from 'lodash';
import { connect } from 'react-redux';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import matchSorter from 'match-sorter';
import TemplatesTableItem from './TemplatesTableItem';
import {
    changePageTemplatesTable, setWorkingLanguage, changeFilterTemplatesTable, toggleMatchingTemplatesTable,
} from '../../../store/actions/actions';
import { languages } from '../../../../lib/languages';
import { can } from '../../../../lib/scopes';
import BotResponseEditor from './BotResponseEditor';
import { ProjectContext } from '../../../layouts/context';
import { withTranslation } from 'react-i18next';

class TemplatesTable extends React.Component {
    constructor(props) {
        super(props);
        this.fixLanguage();
    }

    componentDidUpdate() {
        this.fixLanguage();
    }

    // eslint-disable-next-line react/destructuring-assignment
    getTemplateLanguages = () => sortBy(this.props.nluLanguages);

    getColumns = (lang) => {
        const { projectId, t } = this.props;
        const { dialogueActions } = this.context;
        const columns = [
            {
                id: lang,
                filterable: true,
                accessor: (t) => {
                    const template = find(t.values, { lang });
                    const { sequence = [] } = template || {};
                    const filterableText = sequence.map(val => (val || {}).content).join('');
                    return { sequence, filterableText };
                },
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [`${lang}.filterableText`] }),
                Cell: ({ value: { sequence } }) => <TemplatesTableItem sequence={sequence} />,
                Header: () => languages[lang].name,
                filterAll: true,
            },
        ];

        if (can('responses:r', projectId)) {
            columns.push({
                id: 'edit',
                accessor: 'key',
                className: 'center',
                Cell: ({ value: key, viewIndex: index }) => {
                    const { templates, setActiveEditor } = this.props;
                    const botResponse = templates.find(({ key: templateKey }) => templateKey === key) || {};
                    return (
                        <Icon
                            link
                            data-cy={`edit-response-${index}`}
                            name='edit'
                            color='grey'
                            size='small'
                            onClick={() => setActiveEditor(botResponse._id)}
                        />
                    );
                },
                width: 25,
            });
        }
        if (can('responses:w', projectId)) {
            columns.push({
                id: 'delete',
                accessor: 'key',
                className: 'center',
                Cell: ({ value: key, viewIndex: index }) => {
                    const isInStory = dialogueActions.includes(key);
                    return (
                        <Popup
                            trigger={(
                                <Icon
                                    link
                                    name='delete'
                                    data-cy={`remove-response-${index}`}
                                    color='grey'
                                    size='small'
                                    onClick={() => this.deleteTemplate(key)}
                                    disabled={isInStory || !can('responses:w', projectId)}
                                />
                            )}
                            content={t('colres')}
                            disabled={!isInStory}
                        />
                    );
                },
                width: 25,
            });
        }

        columns.unshift({
            id: 'key',
            accessor: t => t.key,
            Header: t('key'),
            filterable: true,
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['key'] }),
            Cell: props => <div data-cy='template-intent'><Label horizontal basic size='tiny'>{props.value}</Label></div>,
            filterAll: true,
            width: 200,
        });

        return columns;
    };

    getEntities = (entities) => {
        function getStyle(index, size) {
            return index === 0 && size > 1 ? { marginBottom: '10px' } : {};
        }
        return (
            <div style={{ whiteSpace: 'initial', lineHeight: '1.3' }}>
                {entities.map((e, i) => (
                    <Label key={`${e.name}-${e.value}`} style={getStyle(i, entities.length)} basic image size='tiny'>
                        {e.entity}
                        <Label.Detail>{e.value}</Label.Detail>
                    </Label>
                ))}
            </div>
        );
    };

    redirect = (to) => {
        browserHistory.push({
            pathname: to,
        });
    };

    deleteTemplate = (key) => {
        const { projectId, deleteBotResponse } = this.props;
        deleteBotResponse({ variables: { projectId, key } });
    };

    fixLanguage = () => {
        const { workingLanguage, templates, changeWorkingLanguage } = this.props;
        // If on a template page a user selects a language for which there is not template yet, leaves it empty
        // and comes back here, the working language will be set to a language for which there is no template.
        // That's why we need to reset the workingLanguage except if there are no templates yet
        const templateLanguages = this.getTemplateLanguages(templates);
        if (templates.length > 0 && templateLanguages.indexOf(workingLanguage) < 0) {
            changeWorkingLanguage(templateLanguages[0]);
        }
    };

    renderNoLanguagesAvailable = () => {
        const { t } = this.props;
        return (
            <Message
                info
                icon='warning'
                header={t('cnlu')}
                content={t('cnluinfo')}
            />
        )
    };

    renderNoTemplate = () => {
        const { t } = this.props;
        return (
            <Message
                info
                icon='warning'
                header={t('yhcbot')}
                content={(
                    <div>
                        {t('clickon')}&nbsp;
                        <strong>{t('adb')}</strong>
                        &nbsp;{t('but')}
                    </div>
                )}
                data-cy='no-responses'
            />
        )
    };

    renderTable = (lang) => {
        const {
            changePage, pageNumber, templates,
        } = this.props;
        return (
            <>
                {/* <Checkbox className='toggle-nlu-criteria' toggle label='Only show responses with matching criteria' checked={showMatchingCriteria} onChange={toggleMatch} /> */}
                {/* <br /> */}
                <br />
                <ReactTable
                    style={{ background: '#fff' }}
                    data={templates}
                    columns={this.getColumns(lang)}
                    minRows={1}
                    page={pageNumber}
                    onPageChange={changePage}
                    getTdProps={() => ({
                        style: {
                            display: 'flex',
                            verticalAlign: 'top',
                            flexDirection: 'column',
                        },
                    })}
                />
            </>
        );
    };

    getPanes = templates => this.getTemplateLanguages(templates).map(lang => ({
        menuItem: languages[lang].name,
        render: () => this.renderTable(lang),
    }));

    onTabChange = (e, { activeIndex }) => {
        const { changeWorkingLanguage, templates } = this.props;
        changeWorkingLanguage(this.getTemplateLanguages(templates)[activeIndex]);
    };

    static contextType = ProjectContext;

    renderBotResponseEditor() {
        const {
            activeEditor, setActiveEditor, templates,
        } = this.props;
        const botResponse = templates.find(({ _id }) => _id === activeEditor) || {};
        return (
            <BotResponseEditor
                trigger={(
                    <div />
                )}
                open={activeEditor !== null}
                botResponse={botResponse || null}
                closeModal={() => setActiveEditor(null)}
                renameable
            />
        );
    }

    render() {
        const {
            nluLanguages, templates, workingLanguage, newResponse, closeNewResponse, activeEditor,
        } = this.props;
        const activeIndex = this.getTemplateLanguages(templates).indexOf(workingLanguage);
        return (
            <div>
                <br />
                {nluLanguages.length === 0 && this.renderNoLanguagesAvailable()}
                {nluLanguages.length > 0 && templates.length === 0 && this.renderNoTemplate()}
                {nluLanguages.length > 0 && templates.length > 0
                    && (
                        <Tab
                            activeIndex={activeIndex}
                            menu={{ pointing: true, secondary: true }}
                            panes={this.getPanes(templates)}
                            onTabChange={this.onTabChange}
                        />
                    )}
                {newResponse.open && (
                    <BotResponseEditor
                        trigger={<div />}
                        open={newResponse.open}
                        closeModal={closeNewResponse}
                        renameable
                        responseType={newResponse.type}
                        isNew
                    />
                )}
                {activeEditor && this.renderBotResponseEditor()}
            </div>
        );
    }
}

TemplatesTable.propTypes = {
    templates: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    nluLanguages: PropTypes.array.isRequired,
    pageNumber: PropTypes.number.isRequired,
    workingLanguage: PropTypes.string.isRequired,
    changePage: PropTypes.func.isRequired,
    changeWorkingLanguage: PropTypes.func.isRequired,
    deleteBotResponse: PropTypes.func.isRequired,
    activeEditor: PropTypes.string,
    setActiveEditor: PropTypes.func.isRequired,
    newResponse: PropTypes.object,
    closeNewResponse: PropTypes.func.isRequired,
};

TemplatesTable.defaultProps = {
    activeEditor: '', newResponse: { open: false, type: '' },
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    pageNumber: state.settings.get('templatesTablePage'),
    filterText: state.settings.get('templatesTableFilter'),
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changePage: changePageTemplatesTable,
    changeFilter: changeFilterTemplatesTable,
    changeWorkingLanguage: setWorkingLanguage,
    toggleMatch: toggleMatchingTemplatesTable,
};

const TranslatedTemplatesTable = withTranslation()(TemplatesTable)
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TranslatedTemplatesTable);
