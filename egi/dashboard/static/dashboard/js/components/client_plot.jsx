import React, {useCallback, useEffect, useState} from 'react';
import {createPlotSettings, PlotWrapper, useWindowSize} from './plot_wrapper';
import {isObjEmpty} from '../data/transform';
import PropTypes from 'prop-types';
import {Form, Grid, Segment} from 'semantic-ui-react';
import {ColumnFilterDropdown} from './forms/column_filter_dropdown';
import {TimeFilterDropdown} from './forms/time_filter_dropdown';
import {PlotTitleInput} from './forms/plot_title_input';
import {PlotSettingsForm} from './forms/plot_settings_form';
import {DatasetContext, SettingsContext} from '../context';
import {CONSTANTS, HEIGHT_FACTOR} from "../plot/constants";

export const PLOT_PADDING = 14;

export function ClientPlot(props) {
    const [standards, setStandards] = useState(isObjEmpty(props.tabStandards) ? props.plotProps.standards : props.tabStandards);
    const [columnFilter, setColumnFilter] = useState(isObjEmpty(props.tabColumnFilter) || props.tabColumnFilter[CONSTANTS.COL_FILTER_NAME].length === 0 ? props.plotProps.columnFilter : props.tabColumnFilter);
    const [disabledColumnDropdown, setDisabledColumnDropdown] = useState(!isObjEmpty(props.tabColumnFilter) && props.tabColumnFilter[CONSTANTS.COL_FILTER_NAME].length > 0);
    const [timeFilter, setTimeFilter] = useState(props.tabTimeFilter.length === 0 ? props.plotProps.timeFilter : props.tabTimeFilter);
    const [timeFilterRange, setTimeFilterRange] = useState(isObjEmpty(props.tabTimeFilterRange) || props.tabTimeFilterRange[CONSTANTS.TIME_FILTER_START].length === 0 ? props.plotProps.timeFilterRange : props.tabTimeFilterRange);
    const [disabledTimeDropdown, setDisabledTimeDropdown] = useState(props.tabTimeFilter.length > 0);
    const [settings, setSettings] = useState(props.plotProps.settings);
    const [title, setTitle] = useState(props.plotProps.title);
    const [width, height] = useWindowSize();
    const [preGlobalSettings, setPreGlobalSettings] = useState({
        standards: standards,
        columnFilter: columnFilter,
        timeFilter: timeFilter,
        timeFilterRange: timeFilterRange,
    });

    useEffect(() => {
        if (props.hasGlobal) {
            setPreGlobalSettings({
                standards: standards,
                columnFilter: columnFilter,
                timeFilter: timeFilter,
                timeFilterRange: timeFilterRange,
            });
        } else {
            setStandards(preGlobalSettings.standards);
            setDisabledColumnDropdown(false);
            setDisabledTimeDropdown(false);
        }
    }, [props.hasGlobal]);

    useEffect(() => {
        if (props.hasGlobal) {
            setStandards(isObjEmpty(props.tabStandards) ? preGlobalSettings.standards : props.tabStandards);
            setColumnFilter(isObjEmpty(props.tabColumnFilter) || props.tabColumnFilter[CONSTANTS.COL_FILTER_NAME].length === 0 ? preGlobalSettings.columnFilter : props.tabColumnFilter);
            setTimeFilter(props.tabTimeFilter.length === 0 ? preGlobalSettings.timeFilter : props.tabTimeFilter);
            setTimeFilterRange(isObjEmpty(props.tabTimeFilterRange) || props.tabTimeFilterRange[CONSTANTS.TIME_FILTER_START].length === 0 ? preGlobalSettings.timeFilterRange : props.tabTimeFilterRange);
            setDisabledColumnDropdown(!isObjEmpty(props.tabColumnFilter) && props.tabColumnFilter[CONSTANTS.COL_FILTER_NAME].length > 0);
            setDisabledTimeDropdown(props.tabTimeFilter.length > 0);
        }
    }, [props.plotProps, props.tabStandards, props.tabColumnFilter, props.tabTimeFilter, props.tabTimeFilterRange]);

    const plotWidth = useCallback(() => {
        const padding = PLOT_PADDING * 6;
        const paddingAdjustedWidth = width - padding;
        const plotColumnToFormColumnRatio = 13 / 16;
        return paddingAdjustedWidth * plotColumnToFormColumnRatio;
    }, [width]);

    // semantic-react-ui column widths sum to 16
    // >42px -> "mean+median+sd" radio is cut off. >37px -> horizontal scrollbar appears
    const plotSettings = createPlotSettings(props.plotProps.title, standards, columnFilter, timeFilter, timeFilterRange, settings);
    return (
        <Grid.Row style={{height: height * HEIGHT_FACTOR + PLOT_PADDING * 2}}>
            <Grid.Column width={13} className={'plot-container'}>
                <PlotWrapper title={title.length > 0 ? title : props.plotProps.title} standards={standards}
                             dataset={props.dataset} type={props.plotProps.type} settings={plotSettings}
                             displayable={true} height={height * HEIGHT_FACTOR} width={plotWidth()}/>
            </Grid.Column>
            <Grid.Column width={3} className={'plot-form'}>
                <Segment className={'plot-form'} style={{height: height * HEIGHT_FACTOR}}>
                    <Form>
                        <DatasetContext.Provider value={props.dataset}>
                            <PlotTitleInput title={title} setTitle={setTitle}/>
                            <ColumnFilterDropdown columnFilter={columnFilter}
                                                  setColumnFilter={setColumnFilter} disabled={disabledColumnDropdown}/>
                            <TimeFilterDropdown timeFilter={timeFilter} timeFilterRange={timeFilterRange}
                                                setTimeFilter={setTimeFilter} setTimeFilterRange={setTimeFilterRange}
                                                disabled={disabledTimeDropdown}/>
                            <SettingsContext.Provider
                                value={{settings: settings, setSettings: setSettings, clientView: true}}>
                                <PlotSettingsForm type={props.plotProps.type}/>
                            </SettingsContext.Provider>
                        </DatasetContext.Provider>
                    </Form>
                </Segment>
            </Grid.Column>
        </Grid.Row>
    );
}

ClientPlot.propTypes = {
    dataset: PropTypes.object.isRequired,
    plotProps: PropTypes.object.isRequired,
    tabStandards: PropTypes.object.isRequired,
    tabColumnFilter: PropTypes.object.isRequired,
    tabTimeFilter: PropTypes.string.isRequired,
    tabTimeFilterRange: PropTypes.object.isRequired,
    hasGlobal: PropTypes.bool.isRequired
};