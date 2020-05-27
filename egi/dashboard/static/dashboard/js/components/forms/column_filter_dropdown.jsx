import React, {useCallback, useContext, useEffect, useState} from 'react';
import {sortUniqueByAscendingOptions} from '../../data/transform';
import {
    handleDropdownChange, handleDropdownChangeWithDependency, setDefaultFromSettingsIfAny,
    setDefaultFromSettingsOrOptionsIfAny,
    toOptions
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

    const handleDropdownChangeWithDependencyBy = useCallback((setDropdown, _setSettings, _dependency) => handleDropdownChangeWithDependency(setDropdown, _setSettings, _dependency),
        []);
    const setColValueOptionsIfColPresent = useCallback((dataset) => (selected) => setColValueOptions(sortUniqueByAscendingOptions(dataset[selected.value])),
        []);
    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);

    useEffect(() => {
        setColumnOptions(toOptions(Object.keys(data)));

        handleDropdownChangeWithDependencyBy(setColumn, props.setColumnFilter, setColValueOptionsIfColPresent(data))(...setDefaultFromSettingsIfAny(CONSTANTS.COL_FILTER_NAME, hasDefaults, props.columnFilter));
        handleDropdownChangeBy(setValues, props.setColumnFilter)(...setDefaultFromSettingsOrOptionsIfAny(CONSTANTS.COL_FILTER_VALUES, hasDefaults, props.columnFilter, []));

        return () => {
            setColumn('');
            setValues([]);
            setColumnOptions([]);
            setColValueOptions([]);
        }
    }, [name]);

    return (
        <>
            <Form.Select
                id={CONSTANTS.COL_FILTER_NAME}
                label={'Filter by Column (Optional)'}
                placeholder={'Filter by Column (Optional)'}
                value={column}
                options={columnOptions}
                onChange={handleDropdownChangeWithDependencyBy(setColumn, props.setColumnFilter, setColValueOptionsIfColPresent(data))}
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