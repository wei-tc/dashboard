import {CONSTANTS} from "../plot/constants";
import {fetchToJson} from "./fetch";

export const toDict = (dataset) => {
    const headers = dataset[0];
    return dataset.slice(1).reduce((dict, row) => {
        for (let i = 0, l = row.length; i < l; i++) {
            (dict[headers[i]] = dict[headers[i]] || []).push(row[i]);
        }

        return dict;
    }, {})
};

export const sortUniqueByAscendingOptions = (data) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return [...new Set(data.filter(d => d))]
        .map(d => ({
            value: d,
            text: d
        })).sort((d1, d2) => {
            const d1V = d1.value;
            const d2V = d2.value;
            if (d1V > d2V) {
                return 1;
            }
            if (d1V < d2V) {
                return -1;
            }
            return 0;
        });
};

export const postPlot = async (data, url) => {
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
        'Content-Type': 'application/json'
    };

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
};

export const patchPlot = async (data, url) => {
    const headers = {
        'X-CSRFToken': getCookie('csrftoken'),
        'Content-Type': 'application/json'
    };

    return fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(data)
    });
};

const getCookie = (name) => {
    let cookieValue;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

export const merge = (arr, data) => {
    return (arr || []).concat(data);
};

export const max = (arr) => {
    if (!arr) {
        return undefined;
    }

    return d3.max(arr);
};

export const min = (arr) => {
    if (!arr) {
        return undefined;
    }

    return d3.min(arr);
};

export const filterColByIdx = (col, idx) => {
    return idx.map(i => col[i]);
};

const NO_DATA = -1;

/**
 * @param dataset
 * @param yLabels list
 * @param aggregationType
 * @returns {*}
 */
export const filterLastYFromLocationIfLastAggregationType = (dataset, yLabels, aggregationType) => {
    if (aggregationType !== 'Last') {
        return dataset;
    }

    const locationHeader = findHeader(dataset, ['location', 'Location']);
    const byLocation = idxByGroup(dataset, locationHeader);

    const dateHeader = findHeader(dataset, ['date', 'Date']);
    const lastDateIdx = Object.values(byLocation).map(locationIdx => idxOfLastDateWhereYExists(dataset, locationIdx, dateHeader, yLabels));

    const headers = Object.keys(dataset);
    return lastDateIdx.reduce((acc, i) => {
        if (i === NO_DATA) {
            return acc;
        }

        for (let j = headers.length - 1; j >= 0; j--) {
            const header = headers[j];
            (acc[header] = acc[header] || []).push(dataset[header][i]);
        }

        return acc;
    }, {});
};

const idxOfLastDateWhereYExists = (dataset, allLocationIdx, dateHeader, yLabels) => {
    const dates = allLocationIdx.map(locationIdx => dataset[dateHeader][locationIdx]);

    const maxDateIdx = allLocationIdx.reduce((prevLastDateIdx, locationIdx, i) => {
        const currentDate = dates[i];
        const hasY = yLabels.filter(y => dataset[y][locationIdx] !== undefined && dataset[y][locationIdx] !== null);

        if (hasY.length !== yLabels.length) {
            return prevLastDateIdx
        }

        return prevLastDateIdx === NO_DATA || currentDate > dates[prevLastDateIdx] ? i : prevLastDateIdx;
    }, NO_DATA);

    return allLocationIdx[maxDateIdx]
};

export const reduceArrayByType = (data, aggregationType) => {
    switch (aggregationType) {
        case 'None': // each time unit should be an array of only one element
            return data[0];
        case 'Max':
            return d3.max(data);
        case 'Min':
            return d3.min(data);
        case 'Mean':
            return d3.mean(data);
        case 'Median':
            return d3.median(data);
        case 'Last':
            return data[0];
        default:
            console.error(`Unknown aggregation type: ${aggregationType}`);
            return [];
    }
};

export const reduceMatrixByType = (data, type) => {
    switch (type) {
        case 'Max':
            return data.map(col => d3.max(col));
        case 'Min':
            return data.map(col => d3.min(col));
        case 'Mean':
            return data.map(col => d3.mean(col));
        case 'Median':
            return data.map(col => d3.median(col));
        case 'Last':
            return data.flat();
        default:
            console.error(`Unknown aggregation type: ${type}`);
            return [];
    }
};

export const idxByGroup = (dataset, groupBy) => {
    const d = dataset[groupBy].reduce((acc, g, i) => ((acc[g] = acc[g] || []).push(i), acc), {});
    delete d.null;
    return d;
};

export const colByGroup = (dataset, groupBy, colName) => {
    const d = dataset[groupBy].reduce((acc, g, i) => ((acc[g] = acc[g] || []).push(dataset[colName][i]), acc), {});
    delete d.null;
    return d;
};

export const isArrayOfNullOrUndefined = (arr) => {
    return arr.filter(v => v != null).length === 0;
};

export const cleanIfArrayOfNullsOrUndefined = (objOfArrays) => {
    for (let k in objOfArrays) {
        if (isArrayOfNullOrUndefined(objOfArrays[k])) {
            delete objOfArrays[k];
        }
    }
};

export const filterByColValues = (dataset, colName, colValues) => {
    colValues = new Set(colValues);
    return filterByValues(dataset, colName, v => colValues.has(v));
};

export const filterByYearSliderValue = (dataset, timeFilter, value) => {
    if (!timeFilter || timeFilter !== CONSTANTS.YEAR_SELECT || !value || isObjEmpty(dataset)) {
        return dataset;
    }

    return filterByValues(dataset, timeUnit(timeFilter), v => v == value); // allow type coercion
};

export const filterByTimeRange = (dataset, timeFilterSetting, start, end) => {
    if (!timeFilterSetting || (!start && !end)) {
        return dataset;
    }

    const unit = timeUnit(timeFilterSetting);

    if (start && end && start <= end) {
        return filterByValues(dataset, unit, t => start <= t && t <= end)
    } else if (start && !end) {
        return filterByValues(dataset, unit, t => start <= t);
    } else if (end && !start) {
        return filterByValues(dataset, unit, t => t <= end);
    } else {
        return {};
    }
};

/**
 *
 * @param dataset {column: [values]}
 * @param colName
 * @param filterFunc function returns true for values of colName to be included
 * @returns {column: [values]}
 */
export const filterByValues = (dataset, colName, filterFunc) => {
    if (!dataset || !colName) {
        return dataset;
    }

    const colNames = Object.keys(dataset);
    const filtered = {};

    const colData = dataset[colName];
    for (let i = 0; i < colData.length; i++) {
        if (filterFunc(colData[i])) {
            for (let h = 0; h < colNames.length; h++) {
                const header = colNames[h];
                (filtered[header] = filtered[header] || []).push(dataset[header][i]);
            }
        }
    }

    return filtered;
};

export const filterByIdx = (dataset, idx) => {
    if (!dataset || idx.length === 0) {
        return dataset;
    }

    const headers = Object.keys(dataset);
    return idx.reduce((filtered, i) => {
        for (let h = headers.length - 1; h >= 0; h--) {
            const header = headers[h];
            (filtered[header] = filtered[header] || []).push(dataset[header][i]);
        }
        return filtered;
    }, {});
};

export const isObjEmpty = (obj) => {
    return obj === null || obj === undefined || Object.entries(obj).length === 0 && obj.constructor === Object;
};

export const timeUnit = (timeFilterType) => {
    return titleCase(parseTimeFilterType(timeFilterType));
};

const titleCase = (s) => {
    return s && s[0].toUpperCase() + s.slice(1);
};

const parseTimeFilterType = (type) => {
    return type ? type.split('-')[0] : null;
};

export const fetchAllStandardsThenToDropdownOptions = async url => {
    return toDropdownOptions(await fetchToJson(url));
};

const toDropdownOptions = (json) => {
    return json.map(d => ({
        name: d.name,
        standard: JSON.parse(d.standard),
        value: d.name,
        text: d.name
    }))
};

export const filterStandardsBySelected = (standards, selected) => {
    return selected.reduce((selectedStandards, name) => {
        selectedStandards[name] = standards.find(s => s.name === name);
        return selectedStandards;
    }, {})
};
export const findHeader = (dataset, headers) => {
    for (let i = headers.length - 1; i >= 0; i--) {
        if (dataset[headers[i]]) {
            return headers[i];
        }
    }

    console.error(`No column found containing ${headers[headers.length - 1]}`);
};

export const groupToColor = (dataset, xLabel,) => {
    const groups = [...new Set(dataset[xLabel])];
    const numGroups = groups.length;
    return groups.reduce((acc, g, i) => (acc[g] = d3.interpolateSinebow(i / numGroups), acc), {});
};
/**
 * Sorts in-place
 *
 * @param data [{key:}*]
 * @param key string
 * @returns [{}*]
 */
export const sortPlotDataAlphanumericallyByKey = (data, key) => {
    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    const keyFn = (a, b) => [a[key], b[key]];
    data.sort((a, b) => collator.compare(...keyFn(a, b)));
    return data
};
/**
 * Sorts in-place
 * @param data [{name:}*]
 * @returns [{}*]
 */
export const sortPlotDataAlphanumericallyByName = (data) => {
    return sortPlotDataAlphanumericallyByKey(data, 'name');
};
/**
 * Pure function
 *
 * @param data []
 * @returns []
 */
export const sortAlphanumerically = (data) => {
    const sorted = [...data];
    return sorted.sort((a, b) => a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base'
    }));
};