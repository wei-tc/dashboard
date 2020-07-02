import React, {useEffect, useState, useLayoutEffect} from 'react';
import {
    CONSTANTS, PLOT_TYPES,
    plotContainerId,
    plotId,
    removeSpaces,
    VALID_HTML_ID_REGEX
} from '../plot/constants';
import {ALL_PLOT_TYPES, renderPlot} from '../plot/render';
import {Container} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import {isObjEmpty} from '../data/transform';
import {BAR_IS_SAVEABLE} from "./forms/plot_settings_forms/bar_settings";
import {STACKED_BAR_IS_SAVEABLE} from "./forms/plot_settings_forms/stacked_bar_settings";
import {TIMESERIES_IS_SAVEABLE} from "./forms/plot_settings_forms/timeseries_settings";
import {GEOGRAPHICAL_IS_SAVEABLE} from "./forms/plot_settings_forms/geographical_settings";
import {BOX_IS_SAVEABLE} from "./forms/plot_settings_forms/box_settings";
import {PIE_IS_SAVEABLE} from "./forms/plot_settings_forms/pie_settings";
import {SCATTER_IS_SAVEABLE} from "./forms/plot_settings_forms/scatter_settings";

export function Plot(props) {
    useEffect(() => {
        if (props.displayable && isSaveable(props.type, props.settings)) {
            const plotData = {
                name: props.title,
                dataset: props.dataset.name,
                plot_type: props.type,
                [CONSTANTS.SETTINGS]: props.settings,
            };

            renderPlot(plotData, {...props.dataset.data}, props.standards, props.height, props.width);
        }
    }, [props.width, props.height, props.title, props.dataset, props.standards, props.type, props.displayable, props.settings]);



    return (
        <>
            {props.displayable && isSaveable(props.type, props.settings) &&
             <Container id={plotContainerId(props.title, props.dataset.name)} className={'plot-container'} fluid/>}
        </>
    );
}

Plot.propTypes = {
    title: PropTypes.string.isRequired,
    dataset: PropTypes.object.isRequired,
    standards: PropTypes.object.isRequired,
    type: PropTypes.oneOf(ALL_PLOT_TYPES.concat([''])).isRequired,
    settings: PropTypes.object.isRequired,
    displayable: PropTypes.bool.isRequired,
    height: PropTypes.number,
    width: PropTypes.number
};

export const isSaveable = (type, settings) => {
    const PLOT_IS_SAVEABLE = {
        [PLOT_TYPES.Bar]: BAR_IS_SAVEABLE,
        [PLOT_TYPES.Box]: BOX_IS_SAVEABLE,
        [PLOT_TYPES.Geographical]: GEOGRAPHICAL_IS_SAVEABLE,
        [PLOT_TYPES.Pie]: PIE_IS_SAVEABLE,
        [PLOT_TYPES.Scatter]: SCATTER_IS_SAVEABLE,
        [PLOT_TYPES.StackedBar]: STACKED_BAR_IS_SAVEABLE,
        [PLOT_TYPES.TimeSeries]: TIMESERIES_IS_SAVEABLE,
    };

    return Boolean(type in PLOT_IS_SAVEABLE && PLOT_IS_SAVEABLE[type](settings));
};

export const createPlotSettings = (title, standards, columnFilter, timeFilter, timeFilterRange, settings) => {
    return {
        // placing settings first ensures that default settings can be overridden by any of the below, especially where
        // there are default settings of the same
        ...settings,
        [CONSTANTS.INDUSTRY_STANDARDS_FORM]: Object.keys(standards),
        [CONSTANTS.COL_FILTER_NAME]: columnFilter[CONSTANTS.COL_FILTER_NAME],
        [CONSTANTS.COL_FILTER_VALUES]: columnFilter[CONSTANTS.COL_FILTER_VALUES],
        [CONSTANTS.TIME_FILTER_NAME]: timeFilter,
        [CONSTANTS.TIME_FILTER_START]: timeFilterRange[CONSTANTS.TIME_FILTER_START],
        [CONSTANTS.TIME_FILTER_END]: timeFilterRange[CONSTANTS.TIME_FILTER_END],
    };
};

export const isDisplayable = (title, dataset, type) => {
    const spaceFiltered = removeSpaces(title);
    return !isObjEmpty(dataset) && type
           && VALID_HTML_ID_REGEX.test(spaceFiltered)
};

export const clearPlotIfAny = (title, dataset) => {
    if (title === undefined || isObjEmpty(dataset)) {
        return;
    }

    const plotNode = document.getElementById(`${plotId(title, dataset.name)}`);
    if (plotNode) {
        plotNode.remove(); // necessary if the title changes
    }
};

export const useWindowSize = () => {
    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    useLayoutEffect(() => {
        const updateSize = () => {
            setSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
};

