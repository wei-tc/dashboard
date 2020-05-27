export const CONSTANTS = {
    SETTINGS: 'default_settings',
    PLOT_TYPE: 'plot_type',
    INPUT_NOT_MET_ERROR_MSG: '- Minimum required inputs not met -',
    PLOT_CONTAINER: 'plot-container',

    DATASET_NAME_FORM: 'dataset-name-form',
    INDUSTRY_STANDARDS_FORM: 'industry-standards-form',
    PLOT_TITLE_FORM: 'plot-title-form',
    COL_FILTER_NAME: 'col-filter-name',
    COL_FILTER_VALUES: 'col-filter-value',
    PLOT_TYPE_FORM: 'plot-type-form',

    TIME_FILTER_NAME: 'time-filter-name',
    TIME_FILTER_START: 'start-time',
    TIME_FILTER_END: 'end-time',

    YEAR_SELECT: 'year-select',
    YEAR_SLIDER_VALUE: 'year-slider-value',
    YEAR_RANGE: 'year-dropdown',
    MONTH_RANGE: 'month-dropdown',
    DATE_RANGE: 'date-dropdown',

    AGGREGATION_TYPE: 'aggregation-type-form',

    BAR_PLOT: 'bar-plot',
    BAR_X_FORM: 'bar-x-form',
    BAR_Y_FORM: 'bar-y-form',

    STACKEDBAR_PLOT: 'stackedbar-plot',
    STACKEDBAR_X_FORM: 'stackedbar-x-form',
    STACKEDBAR_TYPE_FORM: 'stackedbar-type-form',
    STACKEDBAR_Y_FORM: 'stackedbar-y-form',

    BOX_PLOT: 'box-plot',
    BOX_GROUPS_FORM: 'box-groups-form',
    BOX_Y_SCALE_FORM: 'box-axis-type-form',
    BOX_MEAN_TYPE_FORM: 'box-mean-type-form',
    BOX_OUTLIER_FORM: 'box-type-form',
    BOX_GROUPBY_FORM: 'box-groupby-form',

    GEOGRAPHICAL_PLOT: 'geographical-plot',
    GEOGRAPHICAL_X_FORM: 'geographical-x-form',
    GEOGRAPHICAL_Y_FORM: 'geographical-y-form',

    PIE_PLOT: 'pie-plot',
    PIE_GROUPS_FORM: 'pie-groups-form',

    SCATTER_PLOT: 'scatter-plot',
    SCATTER_X_FORM: 'scatter-x-form',
    SCATTER_X_SCALE_FORM: 'scatter-x-type-form',
    SCATTER_Y_FORM: 'scatter-y-form',
    SCATTER_Y_SCALE_FORM: 'scatter-y-type-form',
    SCATTER_MARKERS_FORM: 'scatter-markers-form',
    SCATTER_SIZE_FORM: 'scatter-size-form',
    SCATTER_CATEGORY_FORM: 'scatter-category-form',
    SCATTER_GROUPBY_FORM: 'scatter-groupby-form',

    TIMESERIES_PLOT: 'timeseries-plot',
    TIMESERIES_X_FORM: 'timeseries-x-form',
    TIMESERIES_Y_FORM: 'timeseries-y-form',
    TIMESERIES_Y_SCALE_FORM: 'timeseries-y-type-form',
    TIMESERIES_SIZE_FORM: 'timeseries-size-form',
    TIMESERIES_GROUPBY_FORM: 'timeseries-groupby-form',

    SAVE_BUTTON: 'save-button',
};

export const SCATTER = {
    CATEGORY: 'Category-Dependent Markers',
    MARKER: 'Markers',
    SCALED: 'Marker-scaled',
};

export const plotId = (name, datasetName) => {
    return toId(`${datasetName}-${name}`);
};

export const plotContainerId = (name, datasetName) => {
    return toId(`plot-${datasetName}-${name}-container`);
};

export const toId = (name) => {
    return name.replace(/^[^a-z]+|[^\w:_-]+/gi, '');
};

export const toSelectorId = (id) => {
    return id.replace(/\./gi, '\\\\.');
};

export const sliderId = (name) => {
    return `${toId(String(name))}-slider-time`;
};

export const removeSpaces = (str) => {
    return str.replace(/\s+/g, '');
};

export const VALID_HTML_ID_REGEX = new RegExp(/^[a-zA-Z][\w:-_]*$/);

export const SAVE_MESSAGE_HEIGHT = 50;

export const PLOT_TYPES = {
    Bar: 'Bar',
    Box: 'Box',
    Geographical: 'Geographical',
    Pie: 'Pie',
    Scatter: 'Scatter',
    StackedBar: 'Stacked Bar',
    TimeSeries: 'Time Series',
};

export const HEIGHT_FACTOR = 0.90;

