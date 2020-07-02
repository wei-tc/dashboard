import {CONSTANTS, plotContainerId, plotId} from './constants';
import {filterByColValues, filterByTimeRange, isObjEmpty,} from '../data/transform';
import {renderBar} from './render/bar';
import {renderGeographical} from "./render/geographical";
import {renderBox} from "./render/box";
import {renderPie} from "./render/pie";
import {renderScatter} from "./render/scatter";
import {renderStackedBar} from "./render/stacked_bar";
import {renderTimeSeries} from "./render/time_series";

export const ALL_PLOT_TYPES = ['Bar', 'Stacked Bar', 'Box', 'Geographical', 'Pie', 'Scatter', 'Time Series'];
export const CONFIG = {responsive: true, displaylogo: false, showSendToCloud: true, scrollZoom: true, plotlyServerURL: 'https://chart-studio.plotly.com'};
export const MARKER_OUTLINE = {
    color: 'DarkSlateGrey',
    width: 1
};
export const PLOT_MARGIN = {
    margin: {
        l: 7,
        r: 7, // if l, r or b < 2, legend scroll bar disappears. scroll bar is 7px
        b: 7,
        t: 30, // if < 30, plot title disappears
    }
};

export const renderPlot = async (plot, dataset, standards, height, width) => {
    const settings = plot[CONSTANTS.SETTINGS];

    let filteredDataset = filterByColValues(dataset, settings[CONSTANTS.COL_FILTER_NAME], settings[CONSTANTS.COL_FILTER_VALUES]);
    filteredDataset = filterByTimeRange(filteredDataset, settings[CONSTANTS.TIME_FILTER_NAME], settings[CONSTANTS.TIME_FILTER_START], settings[CONSTANTS.TIME_FILTER_END]);

    const plotData = getPlotData(plot, filteredDataset, standards, height, width);
    plotData.layout.width = width;
    plotData.layout.height = height;
    const plotNode = setupContainer(plot.name, plot.dataset);
    plotData.config = CONFIG;
    Plotly.react(plotNode, plotData);
};

const getPlotData = (plot, dataset, standards, height, width) => {
    if (isObjEmpty(dataset)) {
        return noData({
            data: [],
            layout: {
                title: plot.name,
                xaxis: {title: 'NO DATA', type: null, automargin: true},
                yaxis: {title: 'NO DATA', type: null, automargin: true},
                ...PLOT_MARGIN,
                height: height,
                width: width
            }
        });
    }

    switch (plot.plot_type) {
        case 'Bar':
            return renderBar(plot, dataset, standards);
        case 'Box':
            return renderBox(plot, dataset, standards);
        case 'Time Series':
            return renderTimeSeries(plot, dataset, standards);
        case 'Pie':
            return renderPie(plot, dataset);
        case 'Scatter':
            return renderScatter(plot, dataset, standards);
        case 'Stacked Bar':
            return renderStackedBar(plot, dataset);
        case 'Geographical':
            return renderGeographical(plot, dataset);
        default:
            console.error(`Unknown plot type: ${plot.plot_type}`);
            return {};
    }
};

/**
 * Mutates categorical. Pass in copy.
 * @param yLabels of type list
 */
export const addStandardTracesIfAny = (data, standards, yLabels, categorical) => {
    if (isObjEmpty(standards)) {
        return data;
    }

    const yNotInStandards = Object.values(standards).filter(s => yLabels.filter(y => s.standard[y]).length > 0).length === 0;
    if (yNotInStandards) {
        return data;
    }

    let x = categorical;

    // dummy variables to ensure that standards span across the plot
    if (categorical && data[0]) {
        const enspace = '\u2002';
        const settings = {
            type: data[0].type,
            y: [0],
            showlegend: false,
            name: '',
            hoverinfo: 'skip',
            opacity: 0
        };
        const dummyA = {
            x: [' '],
            ...settings
        };
        const dummyB = {
            x: [enspace],
            ...settings
        };

        data.unshift(dummyA);
        data.push(dummyB);
        x.push(' ');
        x.push(enspace);
    }

    if (!categorical) {
        x = [d3.min(data.map(d => d3.min(d.x))),
            d3.max(data.map(d => d3.max(d.x)))];

        if (typeof x[0] !== "string") {
            const range = x[1] - x[0];
            const factor = 0.025 * range;
            x = [x[0] - factor, x[1] + factor];
        }
    }

    for (let [name, s] of Object.entries(standards)) {
        for (let molecule of yLabels) {
            if (s.standard[molecule]) {
                data.push({
                    text: `${name}: ${molecule} (${s.standard[molecule]})`,
                    type: 'line',
                    name: `${name}: ${molecule} (${s.standard[molecule]})`,
                    x: x,
                    y: Array(x.length).fill(s.standard[molecule]),
                    mode: 'lines',
                    line: {width: 1, dash: 'dash'},
                    hoverinfo: 'text',
                    hoveron: 'points+fill',
                })
            }
        }
    }

    return data;
};

const noData = (previousLayout) => {
    return {
        data: [],
        layout: {
            title: previousLayout.title,
            xaxis: {title: 'NO DATA', type: previousLayout.xaxis ? previousLayout.xaxis.type : null, automargin: true},
            yaxis: {title: 'NO DATA', type: previousLayout.yaxis ? previousLayout.yaxis.type : null, automargin: true},
            ...PLOT_MARGIN,
            height: previousLayout.height,
            width: previousLayout.width
        }
    };
};

const setupContainer = (name, datasetName) => {
    const id = plotId(name, datasetName);
    let plotNode = document.getElementById(id);

    if (!plotNode) {
        plotNode = document.createElement('div');
        plotNode.id = id;
    }

    // if displaying to client/create page, set up the container and reuse it
    let container = document.getElementById(plotContainerId(name, datasetName));
    if (!container) {
        container = document.createElement('div');
        container.id = plotContainerId(name, datasetName);
    }
    container.appendChild(plotNode);

    return plotNode;
};
