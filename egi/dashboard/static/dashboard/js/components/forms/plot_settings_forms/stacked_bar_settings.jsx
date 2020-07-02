import React, {useCallback, useContext, useEffect, useState} from "react";
import {CONSTANTS} from "../../../plot/constants";
import {Form} from "semantic-ui-react";
import {
    getDefaultFromDropdownOptionsIfAny,
    handleDropdownChange,
    setDefaultFromSettingsIfAny,
    setDefaultFromSettingsOrDropdownOptionsIfAny,
    toDropdownOptions,
    toSelectedOptions
} from "./plot_settings_helpers";
import {isObjEmpty} from "../../../data/transform";
import PropTypes from "prop-types";
import {DatasetContext, SettingsContext} from "../../../context";

export const STACKED_BAR_IS_SAVEABLE = settings => settings[CONSTANTS.STACKEDBAR_X_FORM]
    && settings[CONSTANTS.STACKEDBAR_Y_FORM]
    && settings[CONSTANTS.STACKEDBAR_Y_FORM].length > 0
    && (settings[CONSTANTS.STACKEDBAR_TYPE_FORM] === 'Categorical'
        || settings[CONSTANTS.STACKEDBAR_TYPE_FORM] === 'Numerical'
        && settings[CONSTANTS.AGGREGATION_TYPE]);

const STACKED_BAR_TYPE = toSelectedOptions(['Categorical', 'Numerical'], 'Categorical');
const AGGREGATION_TYPE = toDropdownOptions(['Last', 'Max', 'Min', 'Mean', 'Median']);

export const StackedBarSettings = (props) => {
    const {data, name} = useContext(DatasetContext);
    const {settings, setSettings, clientView} = useContext(SettingsContext);

    const hasDefaults = !isObjEmpty(settings);
    const [columns, setColumns] = useState([]);
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [agg, setAgg] = useState('');
    const [barType, setBarType] = useState('');

    useEffect(() => {
        const options = toDropdownOptions(Object.keys(data));
        setColumns(options);

        handleDropdownChangeBy(setX, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.STACKEDBAR_X_FORM, hasDefaults, settings, getDefaultFromDropdownOptionsIfAny(['Location', 'location'], options)));
        handleDropdownChangeBy(setBarType, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.STACKEDBAR_TYPE_FORM, hasDefaults, settings, STACKED_BAR_TYPE.default));
        handleDropdownChangeBy(setY, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.STACKEDBAR_Y_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setAgg, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.AGGREGATION_TYPE, hasDefaults, settings));

        return () => {
            setX('');
            setBarType('Categorical');
            setY('');
            setAgg('');
        }
    }, [name]);

    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);

    return (
        <>
            <Form.Select
                id={CONSTANTS.STACKEDBAR_X_FORM}
                label={'X Axis'}
                placeholder={'Select the name of a categorical variable to be plotted on the x-axis'}
                options={columns}
                value={x}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setX, setSettings)}
                fluid search
            />
            <Form.Select
                id={CONSTANTS.STACKEDBAR_TYPE_FORM}
                label={'Categorical or Numerical'}
                placeholder={'Select whether you would like to plot a numerical or categorical variable on the y-axis'}
                options={STACKED_BAR_TYPE.options}
                value={barType}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setBarType, setSettings)}
                fluid search
            />
            {barType === 'Categorical' &&
            <Form.Select
                id={CONSTANTS.STACKEDBAR_Y_FORM}
                label={'Y Axis'}
                placeholder={'Select the name of a categorical variable for the y-axis'}
                options={columns}
                value={y}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setY, setSettings)}
                fluid search
            />}
            {barType === 'Numerical' &&
            <Form.Select
                id={CONSTANTS.STACKEDBAR_Y_FORM}
                label={'Groups'}
                placeholder={'Select the names of numerical variables to be stacked on the y-axis'}
                options={columns}
                value={y}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setY, setSettings)}
                fluid multiple clearable search
            />}
            {barType === 'Numerical' &&
            <Form.Select
                id={CONSTANTS.AGGREGATION_TYPE}
                label={'Aggregation Type'}
                placeholder={'Select the aggregation type of bar values'}
                options={AGGREGATION_TYPE}
                value={agg}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setAgg, setSettings)}
                fluid
            />}
        </>
    );
};

StackedBarSettings.propTypes = {
    disabled: PropTypes.bool
};