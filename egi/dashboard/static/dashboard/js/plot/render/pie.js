import {CONSTANTS} from "../constants";
import {filterLastYFromLocationIfLastAggregationType, reduceArrayByType} from "../../data/transform";
import {MARKER_OUTLINE, PLOT_MARGIN} from "../render";

export const renderPie = (plot, dataset) => {
    const settings = plot[CONSTANTS.SETTINGS];

    const labels = settings[CONSTANTS.PIE_GROUPS_FORM];
    const aggregationType = settings[CONSTANTS.AGGREGATION_TYPE];
    const filteredDataset = filterLastYFromLocationIfLastAggregationType(dataset, labels, aggregationType);

    const data = [
        {
            type: 'pie',
            labels: labels,
            values: labels.map(l => reduceArrayByType(filteredDataset[l], aggregationType)),
            opacity: 0.8,
            marker: {
                line: MARKER_OUTLINE
            }
        }
    ];
    const layout = {
        title: plot.name,
        ...PLOT_MARGIN,
    };

    return {data: data, layout: layout};
};