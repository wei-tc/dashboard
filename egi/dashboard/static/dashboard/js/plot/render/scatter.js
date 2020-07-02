import {CONSTANTS, SCATTER} from "../constants";
import {filterByIdx, groupToColor, idxByGroup, max, sortPlotDataAlphanumericallyByName} from "../../data/transform";
import {
    addStandardTracesIfAny,
    MARKER_OUTLINE,
    PLOT_MARGIN
} from "../render";

export const renderScatter = (plot, dataset, standards) => {
    const settings = plot[CONSTANTS.SETTINGS];

    const x = settings[CONSTANTS.SCATTER_X_FORM];
    const xScale = settings[CONSTANTS.SCATTER_X_SCALE_FORM];
    const y = settings[CONSTANTS.SCATTER_Y_FORM];
    const yScale = settings[CONSTANTS.SCATTER_Y_SCALE_FORM];
    const markers = settings[CONSTANTS.SCATTER_MARKERS_FORM];
    const size = settings[CONSTANTS.SCATTER_SIZE_FORM];
    const groupBy = settings[CONSTANTS.SCATTER_GROUPBY_FORM];
    const markerCategory = settings[CONSTANTS.SCATTER_CATEGORY_FORM];

    const data = getScatterData(dataset, groupBy, x, y, size, markers, markerCategory);
    const layout = {
        title: plot.name,
        xaxis: {title: x, type: xScale, automargin: true},
        yaxis: {title: y, type: yScale, automargin: true},
        hovermode: 'closest',
        legend: {
            itemsizing: 'constant',
        },
        ...PLOT_MARGIN,
    };

    if (groupBy || markers === SCATTER.CATEGORY) {
        layout.showlegend = true;
    }

    sortPlotDataAlphanumericallyByName(data);
    return {data: addStandardTracesIfAny(data, standards, [y], false), layout: layout};
};
const getScatterData = (dataset, groupBy, x, y, size, markers, markerCategory) => {
    const maxSize = max(dataset[size]);
    const settings = {
        type: 'scatter',
        mode: 'markers',
        opacity: 0.6
    };
    const markerSettings = {
        sizemode: 'area',
        sizeref: 2 * maxSize / 10000 || 2 / 10000,
        sizemin: 1,
        marker: {
            line: MARKER_OUTLINE
        }
    };

    const isMarkerCategory = (markers === SCATTER.CATEGORY) && markerCategory;

    if (!groupBy && !isMarkerCategory) {
        return [{
            text: size && dataset[size].map(s => `${size} : ${s}`),
            x: dataset[x],
            y: dataset[y],
            hoverinfo: 'x+y+text',
            ...settings,
            marker: {
                size: dataset[size] || 6,
                ...markerSettings
            },
        }];
    }

    if (!groupBy && isMarkerCategory) {
        return Object.entries(idxByGroup(dataset, markerCategory)).map(([category, idx], symbol) => {
            const d = idx.reduce((acc, i) => {
                (acc.x = acc.x || []).push(dataset[x][i]);
                (acc.y = acc.y || []).push(dataset[y][i]);
                (acc.text = acc.text || []).push(category);
                (acc.symbol = acc.symbol || []).push(symbol);
                return acc;
            }, {});

            return {
                text: d.text,
                name: category,
                x: d.x,
                y: d.y,
                hoverinfo: 'x+y+text',
                ...settings,
                marker: {
                    size: 6,
                    symbol: d.symbol,
                    ...markerSettings,
                    marker: {
                        line: MARKER_OUTLINE
                    }
                },
            };
        });
    }

    if (groupBy && isMarkerCategory) {
        const groupByToColor = groupToColor(dataset, groupBy);
        const data = Object.entries(idxByGroup(dataset, markerCategory)).map(([category, cIdx], symbol) => {
            let filtered = filterByIdx(dataset, cIdx);

            return Object.entries(idxByGroup(filtered, groupBy)).map(([g, gIdx]) => {
                const d = gIdx.reduce((acc, i) => {
                    (acc.x = acc.x || []).push(filtered[x][i]);
                    (acc.y = acc.y || []).push(filtered[y][i]);
                    (acc.text = acc.text || []).push(`${category}<br>${groupBy}: ${g}`);
                    (acc.symbol = acc.symbol || []).push(symbol);

                    return acc;
                }, {});

                return {
                    text: d.text,
                    name: `${g}: ${category}`,
                    x: d.x,
                    y: d.y,
                    hoverinfo: 'x+y+text',
                    ...settings,
                    marker: {
                        size: 6,
                        color: groupByToColor[g],
                        symbol: d.symbol || 'circle',
                        ...markerSettings,
                        marker: {
                            line: MARKER_OUTLINE
                        }
                    },
                };
            });
        });

        return data.flat();
    }

    const isMarkerScaled = (markers === SCATTER.SCALED) && size;
    return Object.entries(idxByGroup(dataset, groupBy)).map(([g, idx]) => {
        const d = idx.reduce((acc, i) => {
            (acc.x = acc.x || []).push(dataset[x][i]);
            (acc.y = acc.y || []).push(dataset[y][i]);

            const text = isMarkerScaled ? `${size}: ${dataset[size][i]}<br>${groupBy}: ${g}` : `${groupBy}: ${g}`;
            (acc.text = acc.text || []).push(text);
            isMarkerScaled && (acc.size = acc.size || []).push(dataset[size][i]);

            return acc;
        }, {});

        return {
            text: d.text,
            name: g,
            x: d.x,
            y: d.y,
            hoverinfo: 'x+y+text',
            ...settings,
            marker: {
                size: d.size || 6,
                ...markerSettings,
                marker: {
                    line: MARKER_OUTLINE
                }
            },
        };
    });
};