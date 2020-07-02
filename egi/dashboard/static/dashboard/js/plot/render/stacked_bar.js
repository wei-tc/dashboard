import {
    filterColByIdx,
    filterLastYFromLocationIfLastAggregationType,
    idxByGroup,
    reduceArrayByType, sortPlotDataAlphanumericallyByName
} from "../../data/transform";
import {CONSTANTS} from "../constants";
import {
    MARKER_OUTLINE,
    PLOT_MARGIN,
} from "../render";

export const renderStackedBar = (plot, dataset) => {
    const settings = plot[CONSTANTS.SETTINGS];

    const x = settings[CONSTANTS.STACKEDBAR_X_FORM];
    const type = settings[CONSTANTS.STACKEDBAR_TYPE_FORM];
    const y = (type === 'Categorical') ? [settings[CONSTANTS.STACKEDBAR_Y_FORM]] : settings[CONSTANTS.STACKEDBAR_Y_FORM];
    const aggregationType = settings[CONSTANTS.AGGREGATION_TYPE];
    const filteredDataset = filterLastYFromLocationIfLastAggregationType(dataset, y, aggregationType);

    const data = getStackedBarData(filteredDataset, x, type, y, aggregationType);
    const layout = {
        barmode: 'stack',
        title: plot.name,
        showlegend: true,
        xaxis: {automargin: true},
        yaxis: {automargin: true},
        ...PLOT_MARGIN,
    };

    return {data: data, layout: layout};
};
const getStackedBarData = (dataset, x, type, y, aggregationType) => {
    let idxByX = Object.entries(idxByGroup(dataset, x)).map(([group, idx]) => ({
        name: group,
        [group]: idx
    }));
    idxByX = sortPlotDataAlphanumericallyByName(idxByX);
    const sortedX = idxByX.map(group => group.name);

    if (type === 'Categorical') {
        const aggregatesByY = idxByX.reduce((aggByY, _x, idx) => {
            const xIdx = _x[_x.name];
            let total = 0;

            const countOfAllYCategoricalOfXElement = y.reduce((acc, yLabel) => {
                const yByX = filterColByIdx(dataset[yLabel], xIdx);
                for (let i = 0, length = yByX.length; i < length; i++) {
                    if (yByX[i]) {
                        acc[yByX[i]] = (acc[yByX[i]] || 0) + 1;
                        total++;
                    }
                }

                return acc;
            }, {});

            for (const yCat of Object.keys(countOfAllYCategoricalOfXElement)) {
                aggByY[yCat] = (aggByY[yCat] || []);
                aggByY[yCat][idx] = 100 * countOfAllYCategoricalOfXElement[yCat] / total;
            }

            return aggByY;
        }, {});

        return Object.entries(aggregatesByY).map(([yLabel, aggregateDistribution]) => ({
            type: 'bar',
            name: yLabel,
            text: `${yLabel} (% of total)`,
            hoverinfo: 'y+text',
            x: sortedX,
            y: aggregateDistribution,
            opacity: 0.7,
            marker: {
                line: MARKER_OUTLINE
            }
        }));
    }

    const aggregatesByY = idxByX.reduce((aggByY, _x) => {
        const idx = _x[_x.name];

        const d = y.reduce((acc, yLabel) => {
            const yByX = filterColByIdx(dataset[yLabel], idx);
            acc[yLabel] = reduceArrayByType(yByX, aggregationType);
            acc.sum = (acc.sum || 0) + acc[yLabel];
            return acc;
        }, {});

        for (let i = 0, l = y.length; i < l; i++) {
            const yLabel = y[i];
            (aggByY[yLabel] = aggByY[yLabel] || []).push(100 * d[yLabel] / d.sum);
        }

        return aggByY;
    }, {});

    return Object.entries(aggregatesByY).map(([yLabel, aggregateDistribution]) => ({
        type: 'bar',
        name: yLabel,
        text: `${yLabel} (${aggregationType}) (% of total)`,
        hoverinfo: 'y+text',
        x: sortedX,
        y: aggregateDistribution,
        opacity: 0.7,
        marker: {
            line: MARKER_OUTLINE
        }
    }));
};