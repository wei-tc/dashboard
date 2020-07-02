import React, {useCallback, useContext, useEffect, useState} from 'react';
import {sortUniqueByAscendingOptions} from '../../data/transform';
import {
    handleDropdownChange, handleDropdownChangeWithDependencies, setDefaultFromSettingsIfAny,
    setDefaultFromSettingsOrDropdownOptionsIfAny,
    toDropdownOptions
} from './plot_settings_forms/plot_settings_helpers';
import {Form} from 'semantic-ui-react';
import {CONSTANTS} from '../../plot/constants';
import PropTypes from 'prop-types';
import {DatasetContext} from "../../context";

export function ColumnFilterDropdown(props) {
    const {data, name} = useContext(DatasetContext);

    const hasDefaults = props.columnFilter && props.columnFilter[CONSTANTS.COL_FILTER_NAME];
    const [columnOptions, setColumnOptions] = useState([]);
    const [colValueOptions, setColValueOptions] = useState([]);
    const [column, setColumn] = useState('');
    const [values, setValues] = useState([]);
    const [initialRender, setInitialRender] = useState(true);

    const handleDropdownChangeWithDependenciesBy = useCallback((setDropdown, _setSettings, _dependencies) => handleDropdownChangeWithDependencies(setDropdown, _setSettings, _dependencies),
        []);
    const setColValueOptionsIfColPresent = useCallback((dataset) => (selected) => setColValueOptions(sortUniqueByAscendingOptions(dataset[selected.value])),
        []);
    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);
    const resetValuesDropdown = useCallback(() => handleDropdownChangeBy(setValues, props.setColumnFilter)(null, {
        id: CONSTANTS.COL_FILTER_VALUES,
        value: []
    }), []);

    useEffect(() => {
        setColumnOptions(toDropdownOptions(Object.keys(data)));

        handleDropdownChangeWithDependenciesBy(setColumn, props.setColumnFilter, [setColValueOptionsIfColPresent(data)])(...setDefaultFromSettingsIfAny(CONSTANTS.COL_FILTER_NAME, hasDefaults, props.columnFilter));
        handleDropdownChangeBy(setValues, props.setColumnFilter)(...setDefaultFromSettingsOrDropdownOptionsIfAny(CONSTANTS.COL_FILTER_VALUES, hasDefaults, props.columnFilter, []));

        return () => {
            setColumn('');
            setValues([]);
            setColumnOptions([]);
            setColValueOptions([]);
        }
    }, [name]);

    useEffect(() => {
        if (!initialRender && !props.disabled) {
            props.setColumnFilter(({
                [CONSTANTS.COL_FILTER_NAME]: column,
                [CONSTANTS.COL_FILTER_VALUES]: values
            }));
        } else if (initialRender) {
            setInitialRender(false);
        }
    }, [props.disabled]);

    return (
        <>
            <Form.Select
                id={CONSTANTS.COL_FILTER_NAME}
                label={'Filter by Column (Optional)'}
                placeholder={'Filter by Column (Optional)'}
                value={column}
                options={columnOptions}
                onChange={handleDropdownChangeWithDependenciesBy(setColumn, props.setColumnFilter, [setColValueOptionsIfColPresent(data), resetValuesDropdown])}
                disabled={props.disabled}
                fluid clearable search
            />
            {colValueOptions.length > 0
            && <Form.Select
                id={CONSTANTS.COL_FILTER_VALUES}
                label={'Now select column values to filter by'}
                placeholder={'Now select column values to filter by'}
                value={values}
                options={colValueOptions}
                onChange={handleDropdownChangeBy(setValues, props.setColumnFilter)}
                disabled={props.disabled}
                fluid multiple clearable search
            />}
        </>
    );
}

ColumnFilterDropdown.propTypes = {
    setColumnFilter: PropTypes.func.isRequired,
    columnFilter: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
};