import {CONSTANTS} from '../plot/constants';
import {toDict} from './transform';

export const fetchAllPlotData = async (url) => {
    let allPlotData = [];

    try {
        allPlotData = await fetch(url);
        allPlotData = await allPlotData.json();

        const fetchingFromPermissionsApi = allPlotData.plot;
        if (fetchingFromPermissionsApi) {
            allPlotData = allPlotData.plot;
        }

        for (let i = allPlotData.length - 1; i >= 0; i--) {
            allPlotData[i][CONSTANTS.SETTINGS] = JSON.parse(allPlotData[i][CONSTANTS.SETTINGS]);
        }
    } catch (e) {
        console.error(e);
    }

    return allPlotData;
};

export const fetchAllDatasets = (url, allPlotData) => {
    const willFetchDatasets = {};
    const fetchThenReduceDataset = async (name) => {
        try {
            willFetchDatasets[name] = fetchDatasetThenToDict(`${url}/${name}`);
        } catch (e) {
            console.error(e);
        }
    };

    for (let p = allPlotData.length - 1; p >= 0; p--) {
        const datasetToFetch = allPlotData[p].dataset;
        if (!willFetchDatasets[datasetToFetch]) {
            fetchThenReduceDataset(datasetToFetch);
        }
    }

    return willFetchDatasets;
};

const fetchDatasetThenToDict = async (url) => {
    return toDict(await fetchDataset(url));
};

export const fetchDataset = (url) => {
    return new Promise(resolve => {
        Papa.parse(url, {
            download: true,
            delimiter: ',',
            fastMode: true,
            header: false,
            dynamicTyping: true,
            complete: (data) => resolve(data.data)
        });
    });
};

export const fetchToJson = async url => {
    const response = await fetch(url);
    return await response.json();
};
