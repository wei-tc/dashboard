import {CONSTANTS} from "../../../plot/constants";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {Form} from "semantic-ui-react";
import {
    handleDropdownChange,
    toDropdownOptions,
    handleRadioChange,
    setDefaultFromSettingsIfAny, updateSettingsFromDropdown, updateDropdownSettings
} from "./plot_settings_helpers";
import {isObjEmpty} from "../../../data/transform";
import PropTypes from "prop-types";
import {DatasetContext, SettingsContext} from "../../../context";

export const TIMESERIES_IS_SAVEABLE = settings => settings[CONSTANTS.TIMESERIES_X_FORM]
    && settings[CONSTANTS.TIMESERIES_Y_FORM]
    && settings[CONSTANTS.TIMESERIES_Y_SCALE_FORM]
    && settings[CONSTANTS.AGGREGATION_TYPE];

const AGGREGATION_TYPE = toDropdownOptions(['None', 'Max', 'Min', 'Mean', 'Median']);

export const TimeSeriesSettings = (props) => {
    const {data, name} = useContext(DatasetContext);
    const {settings, setSettings, clientView} = useContext(SettingsContext);

    const hasDefaults = !isObjEmpty(settings);
    const [columns, setColumns] = useState([]);
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [yScale, setYScale] = useState(hasDefaults ? settings[CONSTANTS.TIMESERIES_Y_SCALE_FORM] : 'linear');
    const [groupBy, setGroupBy] = useState('');

    useEffect(() => {
        setColumns(toDropdownOptions(Object.keys(data)));

        handleDropdownChangeBy(setX, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.TIMESERIES_X_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setY, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.TIMESERIES_Y_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setGroupBy, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.TIMESERIES_GROUPBY_FORM, hasDefaults, settings));

        setSettings(s => ({
            ...s,
            [CONSTANTS.AGGREGATION_TYPE]: 'None',
            [CONSTANTS.TIMESERIES_Y_SCALE_FORM]: yScale
        }));

        return () => {
            setX('');
            setY('');
            setYScale('linear');
            setGroupBy('');
        }
    }, [name]);

    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);
    const handleRadioChangeBy = useCallback((setDropdown, _setSettings) => handleRadioChange(setDropdown, _setSettings),
        []);

    return (
        <>
            <Form.Select
                id={CONSTANTS.TIMESERIES_X_FORM}
                label={'X Axis'}
                placeholder={'Select the name of a column containing data in a date format'}
                options={columns}
                value={x}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setX, setSettings)}
                fluid search
            />
            <Form.Select
                id={CONSTANTS.TIMESERIES_Y_FORM}
                label={'Y Axis'}
                placeholder={'Select the name of a column containing numerical data to be plotted on the y-axis'}
                options={columns}
                value={y}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setY, setSettings)}
                fluid search
            />
            <Form.Group inline>
                <Form.Radio
                    label={'Linear'}
                    name={CONSTANTS.TIMESERIES_Y_SCALE_FORM}
                    value={'linear'}
                    checked={yScale === 'linear'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setYScale, setSettings)}/>
                <Form.Radio
                    label={'Log'}
                    name={CONSTANTS.TIMESERIES_Y_SCALE_FORM}
                    value={'log'}
                    checked={yScale === 'log'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setYScale, setSettings)}/>
            </Form.Group>
            <Form.Select
                id={CONSTANTS.TIMESERIES_GROUPBY_FORM}
                label={'Group By (Optional)'}
                placeholder={'Select the name of a categorical variable on which to create separate lines'}
                options={columns}
                value={groupBy}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setGroupBy, setSettings)}
                fluid clearable search
            />
        </>
    );
};

TimeSeriesSettings.propTypes = {
    disabled: PropTypes.bool
};