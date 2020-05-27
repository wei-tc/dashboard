import React, {useCallback, useEffect, useState} from "react";
import {fetchAllStandardsThenToDropdownOptions, filterStandardsBySelected} from "../../data/transform";
import {Form} from "semantic-ui-react";
import {CONSTANTS} from "../../plot/constants";
import PropTypes from "prop-types";

export function IndustryStandardsDropdown(props) {
    const [fetchedStandards, setFetchedStandards] = useState([]);

    useEffect(() => {
        if (props.standards && props.standards.length > 0) {
            setFetchedStandards(props.standards);
        } else {
            fetchStandards();
        }
    }, [props.standards]);

    const fetchStandards = useCallback(async () => {
        const options = await fetchAllStandardsThenToDropdownOptions(props.url);
        setFetchedStandards(options);
    }, []);

    const handleChange = useCallback((e, selected) => {
        if (selected.value.length > 0) {
            const selectedStandards = filterStandardsBySelected(fetchedStandards, selected.value);
            props.setStandards(selectedStandards);
        } else { // set to empty when deleted
            props.setStandards({});
        }
    }, [fetchedStandards]);

    return (
        <Form.Select
            id={CONSTANTS.INDUSTRY_STANDARDS_FORM}
            label={'Industry Standards'}
            placeholder={'Industry Standards'}
            options={fetchedStandards}
            disabled={props.disabled}
            onChange={handleChange}
            fluid multiple clearable search
        />
    );
}

IndustryStandardsDropdown.propTypes = {
    setStandards: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    standards: (props, propName, componentName) => {
        if (!props.standards && !props.url || props.standards && props.url) {
            return new Error(`One of standards or url prop must be provided`);
        }

        if (props.standards && typeof props.standards !== 'object') {
            return new Error(`Standards must be an array of objects`);
        }
    },
    url: (props, propName, componentName) => {
        if (!props.standards && !props.url || props.standards && props.url) {
            return new Error(`One of standards or url prop must be provided`);
        }

        if (props.url && typeof props.url !== 'string') {
            return new Error(`url must be a string`);
        }
    }
};