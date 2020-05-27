import React, {useCallback, useContext, useEffect, useState} from 'react';
import {sortUniqueByAscendingOptions, timeUnit} from '../../data/transform';
import {Form} from 'semantic-ui-react';
import {CONSTANTS} from '../../plot/constants';
import PropTypes from 'prop-types';
import {
    handleDropdownChange,
    setDefaultFromSettingsIfAny, toOptions
} from "./plot_settings_forms/plot_settings_helpers";
import {DatasetContext} from "../../context";

const RANGE_TIME_UNITS = new Set([CONSTANTS.YEAR_RANGE, CONSTANTS.MONTH_RANGE, CONSTANTS.DATE_RANGE]);

const YEAR_SELECT = 'Year';
const YEAR_RANGE = 'Year range';
const MONTH_RANGE = 'Month range';
const DATE_RANGE = 'Date range';

const TO_ELEMENT = {
    [YEAR_SELECT]: CONSTANTS.YEAR_SELECT,
    [YEAR_RANGE]: CONSTANTS.YEAR_RANGE,
    [MONTH_RANGE]: CONSTANTS.MONTH_RANGE,
    [DATE_RANGE]: CONSTANTS.DATE_RANGE,
};

const TO_DISPLAYABLE = {
    [CONSTANTS.YEAR_SELECT]: YEAR_SELECT,
    [CONSTANTS.YEAR_RANGE]: YEAR_RANGE,
    [CONSTANTS.MONTH_RANGE]: MONTH_RANGE,
    [CONSTANTS.DATE_RANGE] : DATE_RANGE,
};

export function TimeFilterDropdown(props) {
    const {data, name} = useContext(DatasetContext);
    const hasDefaults = props.timeFilter && props.timeFilter.length > 0;
    const [filter, setFilter] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);

    const handleFilterChange = useCallback((e, selected) => {
        setFilter(selected.value);
        setStart('');
        setEnd('');
        props.setTimeFilter(selected.value.length === 0 ? '' : TO_ELEMENT[selected.value]);
        props.setTimeFilterRange({})
    }, []);

    const handleYearSelect = useCallback((e, selected) => {
            setStart(selected.value);
            props.setTimeFilterRange(prevSettings => ({
                ...prevSettings,
                [CONSTANTS.TIME_FILTER_START]: selected.value,
                [CONSTANTS.TIME_FILTER_END]: selected.value
            }));
        },
        []);

    useEffect(() => {
        handleFilterChange(null, {value: hasDefaults ? TO_DISPLAYABLE[props.timeFilter] : ''});
        handleDropdownChangeBy(setStart, props.setTimeFilterRange)(...setDefaultFromSettingsIfAny(CONSTANTS.TIME_FILTER_START, hasDefaults, props.timeFilterRange));
        handleDropdownChangeBy(setEnd, props.setTimeFilterRange)(...setDefaultFromSettingsIfAny(CONSTANTS.TIME_FILTER_END, hasDefaults, props.timeFilterRange));

        return () => {
            props.setTimeFilter('');
            props.setTimeFilterRange({});
            setStart('');
            setEnd('');
        }
    }, [name]);

    const timeCol = timeUnit(props.timeFilter);
    const options = RANGE_TIME_UNITS.has(props.timeFilter) ? sortUniqueByAscendingOptions(data[timeCol]) : null;

    return (
        <>
            <Form.Select
                id={CONSTANTS.TIME_FILTER_NAME}
                label={'Filter by Time (Optional)'}
                placeholder={'Filter by Time (Optional)'}
                value={filter}
                options={toOptions([YEAR_SELECT, YEAR_RANGE, MONTH_RANGE, DATE_RANGE])}
                onChange={handleFilterChange}
                disabled={props.disabled}
                fluid clearable search
            />
            {props.timeFilter === CONSTANTS.YEAR_SELECT &&
            <Form.Select
                id={CONSTANTS.YEAR_SELECT}
                label={timeCol}
                placeholder={'Year'}
                value={start}
                options={sortUniqueByAscendingOptions(data[timeCol])}
                onChange={handleYearSelect}
                disabled={props.disabled}
                fluid search clearable
            />}
            {RANGE_TIME_UNITS.has(props.timeFilter) &&
            <>
                <Form.Select
                    id={CONSTANTS.TIME_FILTER_START}
                    label={timeCol}
                    placeholder={'Start (Inclusive)'}
                    options={options}
                    value={start}
                    onChange={handleDropdownChangeBy(setStart, props.setTimeFilterRange)}
                    disabled={props.disabled}
                    fluid search clearable
                />
                <Form.Select
                    id={CONSTANTS.TIME_FILTER_END}
                    placeholder={'End (Inclusive)'}
                    options={options}
                    value={end}
                    onChange={handleDropdownChangeBy(setEnd, props.setTimeFilterRange)}
                    disabled={props.disabled}
                    fluid search clearable
                />
            </>
            }
        </>
    );
}

TimeFilterDropdown.propTypes = {
    timeFilter: PropTypes.string.isRequired,
    timeFilterRange: PropTypes.object.isRequired,
    setTimeFilter: PropTypes.func.isRequired,
    setTimeFilterRange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};
