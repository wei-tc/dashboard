import {CONSTANTS} from "../../../plot/constants";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {Form} from "semantic-ui-react";
import {
    handleDropdownChange, setDefaultFromSettingsIfAny,
    setDefaultFromSettingsOrDropdownOptionsIfAny,
    toDropdownOptions
} from "./plot_settings_helpers";
import {isObjEmpty} from "../../../data/transform";
import PropTypes from "prop-types";
import {DatasetContext, SettingsContext} from "../../../context";

export const PIE_IS_SAVEABLE = settings => settings[CONSTANTS.PIE_GROUPS_FORM]
    && settings[CONSTANTS.PIE_GROUPS_FORM].length > 0
    && settings[CONSTANTS.AGGREGATION_TYPE];

const AGGREGATION_TYPE = toDropdownOptions(['Last', 'Max', 'Min', 'Mean', 'Median']);

export const PieSettings = (props) => {
    const {data, name} = useContext(DatasetContext);
    const {settings, setSettings, clientView} = useContext(SettingsContext);

    const hasDefaults = !isObjEmpty(settings);
    const [columns, setColumns] = useState([]);
    const [groups, setGroups] = useState([]);
    const [agg, setAgg] = useState('');

    useEffect(() => {
        setColumns(toDropdownOptions(Object.keys(data)));

        handleDropdownChangeBy(setGroups, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.PIE_GROUPS_FORM, hasDefaults, settings, []));
        handleDropdownChangeBy(setAgg, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.AGGREGATION_TYPE, hasDefaults, settings));

        return () => {
            setGroups([]);
            setAgg('');
        }
    }, [name]);

    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);

    return (
        <>
            <Form.Select
                id={CONSTANTS.PIE_GROUPS_FORM}
                label={'Groups'}
                placeholder={'Select the names of numerical variables to be pie chart components'}
                options={columns}
                value={groups}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setGroups, setSettings)}
                fluid multiple clearable search
            />
            <Form.Select
                id={CONSTANTS.AGGREGATION_TYPE}
                label={'Aggregation Type'}
                placeholder={'Select the aggregation type of pie components'}
                options={AGGREGATION_TYPE}
                value={agg}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setAgg, setSettings)}
                fluid
            />
        </>
    );
};

PieSettings.propTypes = {
    disabled: PropTypes.bool
};