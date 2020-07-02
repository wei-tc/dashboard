import React, {useCallback, useEffect, useState} from 'react';
import {render} from 'react-dom';
import {postPlot} from './data/transform';
import {CONSTANTS} from './plot/constants';
import {Button, Form, Grid, Message, Segment} from 'semantic-ui-react';
import {clearPlotIfAny, createPlotSettings, isDisplayable, isSaveable, Plot, useWindowSize} from './components/plot';
import {ColumnFilterDropdown} from './components/forms/column_filter_dropdown';
import {TimeFilterDropdown} from './components/forms/time_filter_dropdown';
import {DatasetDropdown} from './components/forms/dataset_dropdown';
import {IndustryStandardsDropdown} from './components/forms/industry_standards_dropdown';
import {PlotTitleInput} from './components/forms/plot_title_input';
import {PlotSettingsForm} from './components/forms/plot_settings_form';
import {PlotTypeDropdown} from './components/forms/plot_type_dropdown';
import {DatasetContext, SettingsContext} from './context';
import {ALL_PLOTS_URL, DATASETS_URL, STANDARDS_URL} from "./api";

const NAVBAR_HEIGHT = 88.84;
const BUTTON_HEIGHT = 64;
const BUTTON_PADDING = 14;
const CONTAINER_MARGIN = 28;
const OTHER_ELEMENT_HEIGHTS = NAVBAR_HEIGHT + BUTTON_HEIGHT + BUTTON_PADDING;

const SUCCESS = <Message positive floating header={'Plot Saved'}/>;
const FAILURE = <Message negative floating
                         content={<p>Plot failed to save. The chosen title has been taken. Try another title. Contact <a href={"mailto:weitao.chi@gmail.com"}>weitao.chi@gmail.com</a> for assistance.</p>}/>;

function CreatePlotForm() {
    const [message, setMessage] = useState(null);
    const [dataset, setDataset] = useState({name: '', data: {}});
    const [standards, setStandards] = useState({});
    const [type, setType] = useState('');
    const [columnFilter, setColumnFilter] = useState({});
    const [timeFilter, setTimeFilter] = useState('');
    const [timeFilterRange, setTimeFilterRange] = useState({});
    const [plotTypeSettings, setPlotTypeSettings] = useState({});
    const [title, setTitle] = useState('');
    const [plotDisplayable, setPlotDisplayable] = useState(false);
    const [width, height] = useWindowSize();

    useEffect(() => {
        setPlotDisplayable(isDisplayable(title, dataset, type));
        return () => {
            setMessage(null);
        }
    }, [title, dataset, standards, type, columnFilter, timeFilter, timeFilterRange, plotTypeSettings]);

    useEffect(() => {
        return () => clearPlotIfAny(title, dataset);
    }, [title, dataset, type]);

    const handleSubmit = useCallback(async e => {
        const data = {
            name: title,
            dataset: dataset.name,
            [CONSTANTS.PLOT_TYPE]: type,
            [CONSTANTS.SETTINGS]: JSON.stringify(createPlotSettings(title, standards, columnFilter, timeFilter, timeFilterRange, plotTypeSettings)),
        };

        const response = await postPlot(data, ALL_PLOTS_URL);
        response['ok'] ? setMessage(SUCCESS) : setMessage(FAILURE);

        setPlotDisplayable(false);
    }, [title, dataset, type, standards, columnFilter, timeFilter, timeFilterRange, plotTypeSettings]);

    const disabled = title.length === 0;

    const createPlotStyle = {
        overflowY: 'auto',
        height: height - OTHER_ELEMENT_HEIGHTS,
        marginBottom: BUTTON_PADDING
    };

    // semantic-react-ui column widths sum to 16
    const settings = createPlotSettings(title, standards, columnFilter, timeFilter, timeFilterRange, plotTypeSettings);
    return (
        <>
            <Grid stackable padded>
                <Grid.Column width={5}>
                    <Segment style={createPlotStyle}>
                        <Form onSubmit={handleSubmit}>
                            <DatasetContext.Provider value={dataset}>
                                <PlotTitleInput title={title} setTitle={setTitle}/>
                                <DatasetDropdown url={DATASETS_URL} setDataset={setDataset}
                                                 disabled={disabled} resetDependencies={() => {
                                    setColumnFilter({});
                                    setTimeFilter('');
                                    setTimeFilterRange({});
                                    setPlotDisplayable(false);
                                    setPlotTypeSettings({});
                                }}/>
                                <IndustryStandardsDropdown url={STANDARDS_URL}
                                                           setStandards={setStandards}
                                                           disabled={disabled}/>
                                <PlotTypeDropdown setType={setType} disabled={disabled}
                                                  resetDependencies={() => {
                                                      setPlotDisplayable(false);
                                                      setPlotTypeSettings({});
                                                  }}/>
                                <ColumnFilterDropdown columnFilter={columnFilter} setColumnFilter={setColumnFilter}
                                                      disabled={disabled}/>
                                <TimeFilterDropdown timeFilter={timeFilter} timeFilterRange={timeFilterRange} disabled={disabled}
                                                    setTimeFilter={setTimeFilter}
                                                    setTimeFilterRange={setTimeFilterRange}/>
                                <SettingsContext.Provider
                                    value={{settings: plotTypeSettings, setSettings: setPlotTypeSettings, clientView: false}}>
                                    <PlotSettingsForm type={type} disabled={disabled}/>
                                </SettingsContext.Provider>
                            </DatasetContext.Provider>
                        </Form>
                    </Segment>
                    <Button
                        id={CONSTANTS.SAVE_BUTTON}
                        onClick={handleSubmit}
                        content={'Save'}
                        type={'submit'}
                        disabled={!plotDisplayable || !isSaveable(type, settings)}
                        fluid
                    />
                </Grid.Column>
                <Grid.Column width={11}>
                    {message}
                    <Plot title={title} standards={standards} dataset={dataset}
                          type={type} settings={settings}
                          displayable={plotDisplayable} height={height - NAVBAR_HEIGHT - CONTAINER_MARGIN}
                    />
                </Grid.Column>
            </Grid>
        </>
    );
}

render(
    <CreatePlotForm/>,
    document.getElementById('plot-form')
);

