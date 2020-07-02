import {CONSTANTS, SCATTER} from "../../../plot/constants";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {Form} from "semantic-ui-react";
import {
    handleDropdownChange, setDefaultFromSettingsIfAny, setDefaultFromSettingsOrDropdownOptionsIfAny,
    toDropdownOptions,
    toSelectedOptions,
    handleRadioChange
} from "./plot_settings_helpers";
import {isObjEmpty} from "../../../data/transform";
import PropTypes from "prop-types";
import {DatasetContext, SettingsContext} from "../../../context";


export const SCATTER_IS_SAVEABLE = settings => settings[CONSTANTS.SCATTER_X_FORM]
    && settings[CONSTANTS.SCATTER_Y_FORM]
    && settings[CONSTANTS.SCATTER_MARKERS_FORM];

const MARKERS = toSelectedOptions([SCATTER.MARKER, SCATTER.SCALED, SCATTER.CATEGORY], SCATTER.MARKER);

export const ScatterSettings = (props) => {
    const {data, name} = useContext(DatasetContext);
    const {settings, setSettings, clientView} = useContext(SettingsContext);

    const hasDefaults = !isObjEmpty(settings);
    const [columns, setColumns] = useState([]);
    const [x, setX] = useState('');
    const [xScale, setXScale] = useState(hasDefaults ? settings[CONSTANTS.SCATTER_X_SCALE_FORM] : 'linear');
    const [y, setY] = useState('');
    const [yScale, setYScale] = useState(hasDefaults ? settings[CONSTANTS.SCATTER_Y_SCALE_FORM] : 'linear');
    const [markerType, setMarkerType] = useState('');
    const [size, setSize] = useState('');
    const [category, setCategory] = useState('');
    const [groupBy, setGroupBy] = useState('');

    useEffect(() => {
        setColumns(toDropdownOptions(Object.keys(data)));

        handleDropdownChangeBy(setX, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.SCATTER_X_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setY, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.SCATTER_Y_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setMarkerType, setSettings)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.SCATTER_MARKERS_FORM, hasDefaults, settings, MARKERS.default));
        handleDropdownChangeBy(setSize, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.SCATTER_SIZE_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setCategory, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.SCATTER_CATEGORY_FORM, hasDefaults, settings));
        handleDropdownChangeBy(setGroupBy, setSettings)(...setDefaultFromSettingsIfAny(CONSTANTS.SCATTER_GROUPBY_FORM, hasDefaults, settings));

        setSettings(s => ({
            ...s,
            [CONSTANTS.SCATTER_X_SCALE_FORM]: xScale,
            [CONSTANTS.SCATTER_Y_SCALE_FORM]: yScale
        }));

        return () => {
            setX('');
            setXScale('linear');
            setY('');
            setYScale('linear');
            setMarkerType(SCATTER.MARKER);
            setSize('');
            setCategory('');
        }
    }, [name]);

    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);
    const handleRadioChangeBy = useCallback((setDropdown, _setSettings) => handleRadioChange(setDropdown, _setSettings),
        []);

    return (
        <>
            <Form.Select
                id={CONSTANTS.SCATTER_X_FORM}
                label={'X Axis'}
                placeholder={'Select the name of a numerical variable to be plotted on the x-axis'}
                options={columns}
                value={x}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setX, setSettings)}
                fluid search
            />
            <Form.Group>
                <Form.Radio
                    label={'Linear'}
                    name={CONSTANTS.SCATTER_X_SCALE_FORM}
                    value={'linear'}
                    checked={xScale === 'linear'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setXScale, setSettings)}
                />
                <Form.Radio
                    label={'Log'}
                    name={CONSTANTS.SCATTER_X_SCALE_FORM}
                    value={'log'}
                    checked={xScale === 'log'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setXScale, setSettings)}
                />
            </Form.Group>
            <Form.Select
                id={CONSTANTS.SCATTER_Y_FORM}
                label={'Y Axis'}
                placeholder={'Select the name of a numerical variable to be plotted on the y-axis'}
                options={columns}
                value={y}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setY, setSettings)}
                fluid search
            />
            <Form.Group>
                <Form.Radio
                    label={'Linear'}
                    name={CONSTANTS.SCATTER_Y_SCALE_FORM}
                    value={'linear'}
                    checked={yScale === 'linear'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setYScale, setSettings)}
                />
                <Form.Radio
                    label={'Log'}
                    name={CONSTANTS.SCATTER_Y_SCALE_FORM}
                    value={'log'}
                    checked={yScale === 'log'}
                    disabled={props.disabled}
                    onChange={handleRadioChangeBy(setYScale, setSettings)}
                />
            </Form.Group>
            <Form.Select
                id={CONSTANTS.SCATTER_MARKERS_FORM}
                label={'Marker Type'}
                placeholder={'Marker Type'}
                options={MARKERS.options}
                value={markerType}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setMarkerType, setSettings)}
                fluid search
            />
            {(markerType === SCATTER.SCALED)
            && <Form.Select
                id={CONSTANTS.SCATTER_SIZE_FORM}
                label={'Marker Size (Optional)'}
                placeholder={'Select the name of a numerical variable to vary the size of graph points'}
                options={columns}
                value={size}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setSize, setSettings)}
                fluid clearable search
            />}
            {(markerType === SCATTER.CATEGORY)
            && <Form.Select
                id={CONSTANTS.SCATTER_CATEGORY_FORM}
                label={'Marker Category (Optional)'}
                placeholder={'Select the name of a categorical variable to vary the shape of graph markers'}
                options={columns}
                value={category}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setCategory, setSettings)}
                fluid clearable search
            />}
            <Form.Select
                id={CONSTANTS.SCATTER_GROUPBY_FORM}
                label={'Group By (Optional)'}
                placeholder={'Select the name of a categorical variable on which to compare points'}
                options={columns}
                value={groupBy}
                disabled={props.disabled}
                onChange={handleDropdownChangeBy(setGroupBy, setSettings)}
                fluid clearable search
            />
        </>
    );
};

ScatterSettings.propTypes = {
    disabled: PropTypes.bool
};
