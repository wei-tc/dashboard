import {CONSTANTS} from "../constants";
import {
    colByGroup,
    filterLastYFromLocationIfLastAggregationType,
    reduceMatrixByType,
    sortPlotDataAlphanumericallyByKey
} from "../../data/transform";
import {
    addStandardTracesIfAny,
    MARKER_OUTLINE,
    PLOT_MARGIN
} from "../render";

export const renderBar = (plot, dataset, standards) => {
    const settings = plot[CONSTANTS.SETTINGS];
    const xLabel = settings[CONSTANTS.BAR_X_FORM];
    const yLabel = settings[CONSTANTS.BAR_Y_FORM];
    const aggregationType = settings[CONSTANTS.AGGREGATION_TYPE];
    const filteredDataset = filterLastYFromLocationIfLastAggregationType(dataset, [yLabel], aggregationType);
    const grouped = colByGroup(filteredDataset, xLabel, yLabel);
    const groups = Object.keys(grouped);

    let tmp = reduceMatrixByType(Object.values(grouped), aggregationType).map((y, idx) => ({
        x: groups[idx],
        y: y
    }));
    sortPlotDataAlphanumericallyByKey(tmp, 'x');

    const data = [{
        type: 'bar',
        name: '',
        text: `${yLabel} (${aggregationType})`,
        x: tmp.map(t => t.x),
        y: tmp.map(t => t.y),
        opacity: 0.7,
        showlegend: false,
        marker: {
            line: MARKER_OUTLINE
        }
    }];

    const layout = {
        title: plot.name,
        xaxis: {title: {text: xLabel}, automargin: true},
        yaxis: {title: {text: yLabel}, automargin: true},
        ...PLOT_MARGIN,
    };
    return {data: addStandardTracesIfAny(data, standards, [yLabel], groups.slice()), layout: layout};
};