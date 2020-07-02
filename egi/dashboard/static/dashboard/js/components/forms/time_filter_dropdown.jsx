import React, {useCallback, useContext, useEffect, useState} from 'react';
import {sortUniqueByAscendingOptions, timeUnit} from '../../data/transform';
import {Form} from 'semantic-ui-react';
import {CONSTANTS} from '../../plot/constants';
import PropTypes from 'prop-types';
import {
    handleDropdownChange,
    setDefaultFromSettingsIfAny, toDropdownOptions
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
    '': ''
};

const TO_DISPLAYABLE = {
    [CONSTANTS.YEAR_SELECT]: YEAR_SELECT,
    [CONSTANTS.YEAR_RANGE]: YEAR_RANGE,
    [CONSTANTS.MONTH_RANGE]: MONTH_RANGE,
    [CONSTANTS.DATE_RANGE]: DATE_RANGE,
};

export function TimeFilterDropdown(props) {
    const {data, name} = useContext(DatasetContext);
    const hasDefaults = props.timeFilter && props.timeFilter.length > 0;
    const [filter, setFilter] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [timeOptions, setTimeOptions] = useState(sortUniqueByAscendingOptions(data[timeUnit(TO_ELEMENT[filter])]));
    const [initialRender, setInitialRender] = useState(true);
    const handleDropdownChangeBy = useCallback((setDropdown, _setSettings) => handleDropdownChange(setDropdown, _setSettings),
        []);

    const handleFilterChange = useCallback((dataset) => (e, selected) => {
        setFilter(selected.value);
        setStart('');
        setEnd('');
        setTimeOptions(sortUniqueByAscendingOptions(dataset[timeUnit(TO_ELEMENT[selected.value])]));
        props.setTimeFilter(TO_ELEMENT[selected.value]);
        props.setTimeFilterRange({[CONSTANTS.TIME_FILTER_START]: '', [CONSTANTS.TIME_FILTER_END]: ''})
    }, []);

    const handleYearSelect = useCallback((e, selected) => {
            setStart(selected.value);
            setEnd(selected.value);
            props.setTimeFilterRange({
                [CONSTANTS.TIME_FILTER_START]: selected.value,
                [CONSTANTS.TIME_FILTER_END]: selected.value
            });
        },
        []);

    useEffect(() => {
        handleFilterChange(data)(null, {value: hasDefaults ? TO_DISPLAYABLE[props.timeFilter] : ''});
        handleDropdownChangeBy(setStart, props.setTimeFilterRange)(...setDefaultFromSettingsIfAny(CONSTANTS.TIME_FILTER_START, hasDefaults, props.timeFilterRange));
        handleDropdownChangeBy(setEnd, props.setTimeFilterRange)(...setDefaultFromSettingsIfAny(CONSTANTS.TIME_FILTER_END, hasDefaults, props.timeFilterRange));

        return () => {
            setFilter('');
            setStart('');
            setEnd('');
            setTimeOptions([]);
        }
    }, [name]);

    useEffect(() => {
        if (!initialRender && !props.disabled) {
            props.setTimeFilter(TO_ELEMENT[filter]);
            props.setTimeFilterRange({
                [CONSTANTS.TIME_FILTER_START]: start,
                [CONSTANTS.TIME_FILTER_END]: end
            });
        } else if (initialRender) {
            setInitialRender(false);
        }
    }, [props.disabled]);

    return (
        <>
            <Form.Select
                id={CONSTANTS.TIME_FILTER_NAME}
                label={'Filter by Time (Optional)'}
                placeholder={'Filter by Time (Optional)'}
                value={filter}
                options={toDropdownOptions([YEAR_SELECT, YEAR_RANGE, MONTH_RANGE, DATE_RANGE])}
                onChange={handleFilterChange(data)}
                disabled={props.disabled}
                fluid clearable search
            />
            {TO_ELEMENT[filter] === CONSTANTS.YEAR_SELECT &&
            <Form.Select
                id={CONSTANTS.YEAR_SELECT}
                label={'Year'}
                placeholder={'Year'}
                value={start}
                options={timeOptions}
                onChange={handleYearSelect}
                disabled={props.disabled}
                fluid search clearable
            />}
            {RANGE_TIME_UNITS.has(TO_ELEMENT[filter]) &&
            <>
                <Form.Select
                    id={CONSTANTS.TIME_FILTER_START}
                    label={timeUnit(TO_ELEMENT[filter])}
                    placeholder={'Start (Inclusive)'}
                    options={timeOptions}
                    value={start}
                    onChange={handleDropdownChangeBy(setStart, props.setTimeFilterRange)}
                    disabled={props.disabled}
                    fluid search clearable
                />
                <Form.Select
                    id={CONSTANTS.TIME_FILTER_END}
                    placeholder={'End (Inclusive)'}
                    options={timeOptions}
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
