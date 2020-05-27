import {CONSTANTS} from "../../../plot/constants";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {Form} from "semantic-ui-react";
import {
    getDefaultFromOptionsIfAny,
    handleDropdownChange, setDefaultFromSettingsIfAny, setDefaultFromSettingsOrOptionsIfAny,
    toOptions
} from "./plot_settings_helpers";
import {isObjEmpty} from "../../../data/transform";
import PropTypes from "prop-types";
import {DatasetContext, SettingsContext} from "../../../context";

export const GEOGRAPHICAL_IS_SAVEABLE = settings => settings[CONSTANTS.GEOGRAPHICAL_X_FORM]
    && settings[CONSTANTS.GEOGRAPHICAL_Y_FORM]
    && settings[CONSTANTS.AGGREGATION_TYPE];

const AGGREGATION_TYPE = toOptions(['Last', 'Max', 'Min', 'Mean', 'Median']);

export const GeographicalSettings = (props) => {
    const {data, name} = useContext(DatasetContext);
    const {settings, setSettings} = useContext(SettingsContext);

    const hasDefaults = !isObjEmpty(settings);
    const [columns, setColumns] = useState([]);
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [agg, setAgg] = useState('');

    useEffect(() => {
        const options = toOptions(Object.keys(data));
        setColumns(options);

        handleDropdownChangeBy(setX, setSettings)(...setDefaultFromSettingsOrOptionsIfAny(CONSTANTS.GEOGRAPHICAL_X_FORM, hasDefaults, settings, getDefaultFromOptionsIfAny(['Location', 'location'], options)));
        handleDropdownChangeBy(setY, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.GEOGRAPHICAL_Y_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setAgg, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.AGGREGATION_TYPE, hasDefaults, settings));

        return () => {
            setX('');
            setY('');
            setAgg('');
        }
    }, [name]);

    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);

    return (<>
            <Form.Select
                id={CONSTANTS.GEOGRAPHICAL_X_FORM}
                label={'Location'}
                placeholder={'Column header corresponding to site locations'}
                options={columns}
                value={x}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setX, setSettings)}
                fluid search
            />
            <Form.Select
                id={CONSTANTS.GEOGRAPHICAL_Y_FORM}
                label={'Marker Size'}
                placeholder={'Marker Size'}
                options={columns}
                value={y}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setY, setSettings)}
                fluid search
            />
            <Form.Select
                id={CONSTANTS.AGGREGATION_TYPE}
                label={'Aggregation Type'}
                placeholder={'Aggregation Type'}
                options={AGGREGATION_TYPE}
                value={agg}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setAgg, setSettings)}
                fluid
            />
        </>
    );
};

GeographicalSettings.propTypes = {
    disabled: PropTypes.bool
};