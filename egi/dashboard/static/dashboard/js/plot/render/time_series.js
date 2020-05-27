import {CONSTANTS} from "../constants";
import {
    cleanIfArrayOfNullsOrUndefined,
    colByGroup,
    idxByGroup,
    reduceArrayByType,
    sortPlotDataAlphanumericallyByName
} from "../../data/transform";
import {addStandardTracesIfAny, plot_height, PLOT_MARGIN} from "../render";

export const renderTimeSeries = (plot, dataset, standards) => {
    const settings = plot[CONSTANTS.SETTINGS];

    const x = settings[CONSTANTS.TIMESERIES_X_FORM];
    const y = settings[CONSTANTS.TIMESERIES_Y_FORM];
    const yScale = settings[CONSTANTS.TIMESERIES_Y_SCALE_FORM];
    const groupBy = settings[CONSTANTS.TIMESERIES_GROUPBY_FORM];
    const aggregationType = settings[CONSTANTS.AGGREGATION_TYPE];

    const data = getTimeSeriesData(dataset, x, y, groupBy, aggregationType);
    const layout = {
        title: plot.name,
        xaxis: {title: x, type: 'date', automargin: true},
        yaxis: {title: y, type: yScale, automargin: true},
        showlegend: true,
        ...PLOT_MARGIN,
        height: plot_height
    };

    sortPlotDataAlphanumericallyByName(data);
    return {data: addStandardTracesIfAny(data, standards, [y], false), layout: layout}
};
const getTimeSeriesData = (dataset, t, y, groupBy, aggregationType) => {
    if (!groupBy) {
        const yByTime = colByGroup(dataset, t, y);
        delete yByTime.null;
        cleanIfArrayOfNullsOrUndefined(yByTime);

        let time = Object.keys(yByTime);
        let yReduced = time.map(_t => reduceArrayByType(yByTime[_t], aggregationType));

        return [{
            type: 'scatter',
            name: y,
            x: time,
            y: yReduced,
            opacity: 0.8,
        }];
    }

    return Object.entries(idxByGroup(dataset, groupBy)).map(([g, idx]) => {
        const yByTimeByGroup = idx.reduce(
            (acc, i) => ((acc[dataset[t][i]] = acc[dataset[t][i]] || []).push(dataset[y][i]), acc), {});
        delete yByTimeByGroup.null;
        cleanIfArrayOfNullsOrUndefined(yByTimeByGroup);

        const timeByGroup = Object.keys(yByTimeByGroup);
        const yReduced = timeByGroup.map(_t => reduceArrayByType(yByTimeByGroup[_t], aggregationType));

        return {
            type: 'scatter',
            name: g,
            x: timeByGroup,
            y: yReduced,
            opacity: 0.8,
        };
    });
};