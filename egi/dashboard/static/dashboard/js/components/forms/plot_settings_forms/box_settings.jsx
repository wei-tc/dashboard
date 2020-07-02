import {CONSTANTS} from "../../../plot/constants";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {Form} from "semantic-ui-react";
import {
    getDefaultFromDropdownOptionsIfAny,
    handleDropdownChange, setDefaultFromSettingsOrDropdownOptionsIfAny,
    toDropdownOptions,
    toSelectedOptions,
    handleRadioChange, setDefaultFromSettingsIfAny
} from "./plot_settings_helpers";
import {isObjEmpty} from "../../../data/transform";
import PropTypes from "prop-types";
import {DatasetContext, SettingsContext} from "../../../context";

export const BOX_IS_SAVEABLE = settings => settings[CONSTANTS.BOX_GROUPS_FORM]
    && settings[CONSTANTS.BOX_GROUPS_FORM].length > 0
    && settings[CONSTANTS.BOX_OUTLIER_FORM]
    && settings[CONSTANTS.BOX_Y_SCALE_FORM]
    && settings[CONSTANTS.BOX_MEAN_TYPE_FORM]
    && settings[CONSTANTS.BOX_OUTLIER_FORM];

const TYPE = toSelectedOptions(['Include outliers', 'Exclude outliers but display as points', 'Exclude and hide outliers', 'Exclude outliers and display all points'], 'Include outliers');

export const BoxSettings = (props) => {
    const {data, name} = useContext(DatasetContext);
    const {settings, setSettings, clientView} = useContext(SettingsContext);

    const hasDefaults = !isObjEmpty(settings);
    const [columns, setColumns] = useState([]);
    const [groups, setGroups] = useState([]);
    const [yScale, setYScale] = useState(hasDefaults ? settings[CONSTANTS.BOX_Y_SCALE_FORM] : 'linear');
    const [outlier, setOutlier] = useState('');
    const [meanType, setMeanType] = useState(hasDefaults ? settings[CONSTANTS.BOX_MEAN_TYPE_FORM] : 'median');
    const [groupBy, setGroupBy] = useState('');

    useEffect(() => {
        const options = toDropdownOptions(Object.keys(data));
        setColumns(options);

        handleDropdownChangeBy(setGroups, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.BOX_GROUPS_FORM, hasDefaults, settings, []));
        handleDropdownChangeBy(setOutlier, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.BOX_OUTLIER_FORM, hasDefaults, settings, TYPE.default));
        if (clientView) {
            handleDropdownChangeBy(setGroupBy, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.BOX_GROUPBY_FORM, hasDefaults, settings));
        } else {
            handleDropdownChangeBy(setGroupBy, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(
                CONSTANTS.BOX_GROUPBY_FORM, hasDefaults, settings, getDefaultFromDropdownOptionsIfAny(['Location', 'location'], options)));
        }

        setSettings(s => ({
            ...s,
            [CONSTANTS.BOX_Y_SCALE_FORM]: yScale,
            [CONSTANTS.BOX_MEAN_TYPE_FORM]: meanType
        }));

        return () => {
            setGroups([]);
            setYScale('linear');
            setOutlier('Include outlier');
            setMeanType('median');
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
                id={CONSTANTS.BOX_GROUPS_FORM}
                label={'Y Axis'}
                placeholder={'Select the names of numerical variables to be plotted on the y-axis'}
                options={columns}
                value={groups}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setGroups, setSettings)}
                fluid multiple clearable search
            />
            <Form.Group inline>
                <Form.Radio
                    label={'Linear'}
                    name={CONSTANTS.BOX_Y_SCALE_FORM}
                    value={'linear'}
                    checked={yScale === 'linear'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setYScale, setSettings)}
                />
                <Form.Radio
                    label={'Log'}
                    name={CONSTANTS.BOX_Y_SCALE_FORM}
                    value={'log'}
                    checked={yScale === 'log'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setYScale, setSettings)}
                />
            </Form.Group>
            <Form.Group inline>
                <Form.Radio
                    label={'Median'}
                    name={CONSTANTS.BOX_MEAN_TYPE_FORM}
                    value={'median'}
                    checked={meanType === 'median'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setMeanType, setSettings)}
                />
                <Form.Radio
                    label={'Median + Mean'}
                    name={CONSTANTS.BOX_MEAN_TYPE_FORM}
                    value={'median + mean'}
                    checked={meanType === 'median + mean'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setMeanType, setSettings)}
                />
                <Form.Radio
                    label={'Median + Mean + SD'}
                    name={CONSTANTS.BOX_MEAN_TYPE_FORM}
                    value={'median + mean + sd'}
                    checked={meanType === 'median + mean + sd'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setMeanType, setSettings)}
                />
            </Form.Group>
            <Form.Select
                id={CONSTANTS.BOX_OUTLIER_FORM}
                label={'Outlier Handling'}
                placeholder={'Outlier Handling'}
                options={TYPE.options}
                value={outlier}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setOutlier, setSettings)}
                fluid
            />
            <Form.Select
                id={CONSTANTS.BOX_GROUPBY_FORM}
                label={'Group By (Optional)'}
                placeholder={'Select the name of a categorical variable on which to divide boxes'}
                options={columns}
                value={groupBy}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setGroupBy, setSettings)}
                fluid clearable search
            />
        </>
    );
};

BoxSettings.propTypes = {
    disabled: PropTypes.bool
};