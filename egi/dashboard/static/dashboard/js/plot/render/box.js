import {
    filterColByIdx,
    idxByGroup,
    merge,
    sortAlphanumerically,
    sortPlotDataAlphanumericallyByName
} from "../../data/transform";
import {CONSTANTS} from "../constants";
import {
    addStandardTracesIfAny,
    plot_height,
    PLOT_MARGIN
} from "../render";

export const renderBox = (plot, dataset, standards) => {
    const settings = plot[CONSTANTS.SETTINGS];

    const groups = sortAlphanumerically(settings[CONSTANTS.BOX_GROUPS_FORM]);
    const meanType = getMeanType(settings[CONSTANTS.BOX_MEAN_TYPE_FORM]);
    const yScale = settings[CONSTANTS.BOX_Y_SCALE_FORM];
    const boxType = getBoxType(settings[CONSTANTS.BOX_OUTLIER_FORM]);
    const groupBy = settings[CONSTANTS.BOX_GROUPBY_FORM];
    const boxMode = settings[CONSTANTS.BOX_GROUPBY_FORM] ? 'group' : 'overlay';

    const data = getBoxData(dataset, groups, boxType, meanType, groupBy);
    const layout = {
        title: plot.name,
        xaxis: {automargin: true},
        yaxis: {type: yScale, automargin: true},
        boxmode: boxMode,
        showlegend: true,
        ...PLOT_MARGIN,
        height: plot_height
    };

    sortPlotDataAlphanumericallyByName(data);
    return {data: addStandardTracesIfAny(data, standards, groups, groups.slice()), layout: layout};
};

const getMeanType = (meanType) => {
    switch (meanType) {
        case 'median':
            return false;
        case 'median + mean':
            return true;
        case 'median + mean + sd':
            return 'sd';
        default:
            console.error(`Invalid boxmean: ${meanType}`);
            return false;
    }
};

const getBoxType = (boxType) => {
    switch (boxType) {
        case 'Include outliers':
            return false;
        case 'Exclude outliers but display as points':
            return 'suspectedoutliers';
        case 'Exclude and hide outliers':
            return 'outliers';
        case 'Exclude outliers and display all points':
            return 'all';
        default:
            console.error(`Invalid boxpoints: ${boxType}`);
            return 'all'
    }
};

const getBoxData = (dataset, groups, boxType, meanType, groupBy) => {
    const settings = {
        type: 'box',
        boxpoints: boxType,
        jitter: 0.3,
        boxmean: meanType,
        marker: {
            opacity: (boxType === 'outliers') ? 0 : 100,
        },
    };

    if (!groupBy) {
        return groups.map(g => ({
            name: g,
            y: dataset[g],
            ...settings
        }));
    }

    return Object.entries(idxByGroup(dataset, groupBy)).map(([g, idx]) => {
        const data = groups.reduce((acc, x) => {
            acc.y = merge(acc.y, filterColByIdx(dataset[x], idx));
            acc.x = merge(acc.x, Array(idx.length).fill(x));
            return acc;
        }, {});

        return {
            name: g,
            x: data.x,
            y: data.y,
            ...settings
        };
    });
};