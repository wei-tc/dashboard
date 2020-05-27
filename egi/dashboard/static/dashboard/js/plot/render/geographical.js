import {CONSTANTS} from "../constants";
import {
    filterLastYFromLocationIfLastAggregationType,
    findHeader,
    idxByGroup,
    isObjEmpty,
    max,
    min,
    reduceArrayByType, sortPlotDataAlphanumericallyByName
} from "../../data/transform";
import {plot_height, PLOT_MARGIN} from "../render";

export const renderGeographical = (plot, dataset) => {
    //Renders geographical bubble plot from dataset
    //Currently assumes that latitude column is labelled 'Lat'
    //and longitude column is labelled 'Lon'. Admin should have flexibility to select
    //the latitude and longitude columns in the graph creation page.

    const settings = plot[CONSTANTS.SETTINGS];

    const xLabel = settings[CONSTANTS.GEOGRAPHICAL_X_FORM];
    const yLabel = settings[CONSTANTS.GEOGRAPHICAL_Y_FORM];
    const aggregationType = settings[CONSTANTS.AGGREGATION_TYPE];
    const filteredDataset = filterLastYFromLocationIfLastAggregationType(dataset, [yLabel], aggregationType);

    const longHeader = findHeader(filteredDataset, ['lon', 'long', 'Lon', 'Long', 'longitude', 'Longitude']);
    const latHeader = findHeader(filteredDataset, ['lat', 'Lat', 'latitude', 'Latitude']);

    const d = getGeographicalData(filteredDataset, xLabel, yLabel, aggregationType, latHeader, longHeader);

    const minLat = min(filteredDataset[latHeader]);
    const minLon = min(filteredDataset[longHeader]);
    const maxLat = max(filteredDataset[latHeader]);
    const maxLon = max(filteredDataset[longHeader]);

    const layout = {
        title: plot.name,
        autosize: true,
        mapbox: {
            zoom: 10,
            style: 'satellite',
            center: {
                lat: (maxLat + minLat) / 2,
                lon: (maxLon + minLon) / 2
            },
        },
        legend: {
            itemsizing: 'constant',
        },
        ...PLOT_MARGIN,
        height: plot_height
    };

    Plotly.setPlotConfig({
        mapboxAccessToken: 'pk.eyJ1Ijoid2VpdGMiLCJhIjoiY2thbm9ybHBuMGV0YzJ4b2dsMm5zeHZwdCJ9.4uo7G2ufzWch_RsOn_jqPg'
    });

    return {data: sortPlotDataAlphanumericallyByName(d), layout: layout};
};
const getGeographicalData = (dataset, x, y, type, lat, lon) => {
    return Object.entries(idxByGroup(dataset, x)).reduce((data, [location, idx]) => {
        const d = idx.reduce((acc, i) => {
            if (!dataset[y][i]) {
                return acc;
            }

            (acc.x = acc.x || []).push(dataset[x][i]);
            (acc.y = acc.y || []).push(dataset[y][i]);
            (acc.lon = acc.lon || []).push(dataset[lon][i]);
            (acc.lat = acc.lat || []).push(dataset[lat][i]);

            return acc;
        }, {});

        if (isObjEmpty(d)) {
            return data;
        }

        const aggregatedY = reduceArrayByType(d.y, type);

        data.push({
            text: `${location}<br>${y} (${type}): ${aggregatedY}`,
            name: location,
            hoverinfo: 'lat+lon+text',
            lat: d.lat,
            lon: d.lon,
            showlegend: true,
            line: {
                width: 1,
            },
            type: 'scattermapbox',
            opacity: 0.6,
            marker: {
                minsize: 10,
                size: Math.sqrt(Math.sqrt(aggregatedY)) * 15, // scale logarithmically to reduce disparity between large and small values
                // scaling untested on other datasets - may need to be varied
            }
        });

        return data;
    }, []);
};