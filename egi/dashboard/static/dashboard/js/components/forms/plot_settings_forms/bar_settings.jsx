import {CONSTANTS} from "../../../plot/constants";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {Form} from "semantic-ui-react";
import {
    getDefaultFromDropdownOptionsIfAny,
    handleDropdownChange,
    setDefaultFromSettingsIfAny, setDefaultFromSettingsOrDropdownOptionsIfAny,
    toDropdownOptions,
} from "./plot_settings_helpers";
import {isObjEmpty} from "../../../data/transform";
import PropTypes from "prop-types";
import {DatasetContext, SettingsContext} from "../../../context";

export const BAR_IS_SAVEABLE = settings => settings[CONSTANTS.BAR_X_FORM]
    && settings[CONSTANTS.BAR_Y_FORM]
    && settings[CONSTANTS.AGGREGATION_TYPE];

const AGGREGATION_TYPE = toDropdownOptions(['Last', 'Max', 'Min', 'Mean', 'Median']);

export const BarSettings = (props) => {
    const {data, name} = useContext(DatasetContext);
    const {settings, setSettings, clientView} = useContext(SettingsContext);

    const hasDefaults = !isObjEmpty(settings);
    const [columns, setColumns] = useState([]);
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [agg, setAgg] = useState('');

    useEffect(() => {
        const options = toDropdownOptions(Object.keys(data));
        setColumns(options);

        handleDropdownChangeBy(setX, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.BAR_X_FORM, hasDefaults, settings, getDefaultFromDropdownOptionsIfAny(['Location', 'location'], options)));
        handleDropdownChangeBy(setY, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.BAR_Y_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setAgg, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.AGGREGATION_TYPE, hasDefaults, settings));

        return () => {
            setX('');
            setY('');
            setAgg('');
        }
    }, [name]);

    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);

    return (
        <>
            <Form.Select
                id={CONSTANTS.BAR_X_FORM}
                label={'X Axis'}
                placeholder={'Select the name of a categorical variable to be plotted on the x-axis'}
                options={columns}
                value={x}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setX, setSettings)}
                fluid search
            />
            <Form.Select
                id={CONSTANTS.BAR_Y_FORM}
                label={'Y Axis'}
                placeholder={'Select the name of a numerical variable to be plotted on the y-axis'}
                options={columns}
                value={y}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setY, setSettings)}
                fluid search
            />
            <Form.Select
                id={CONSTANTS.AGGREGATION_TYPE}
                label={'Aggregation Type'}
                placeholder={'Select the aggregation type of bar values'}
                options={AGGREGATION_TYPE}
                value={agg}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setAgg, setSettings)}
                fluid
            />
        </>
    );
};

BarSettings.propTypes = {
    disabled: PropTypes.bool
};
