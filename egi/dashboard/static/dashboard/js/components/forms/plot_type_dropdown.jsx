import React, {useCallback, useContext, useEffect, useState} from "react";
import {Form} from "semantic-ui-react";
import {CONSTANTS} from "../../plot/constants";
import {handleDropdownChange, PLOT_TYPE_OPTIONS} from "./plot_settings_forms/plot_settings_helpers";
import PropTypes from "prop-types";
import {DatasetContext} from "../../context";

export function PlotTypeDropdown(props) {
    const {data, name} = useContext(DatasetContext);
    const [type, setType] = useState('');

    const handleChange = useCallback((e, selected) => {
        props.setType(selected.value);
        setType(selected.value);
        props.resetDependencies();
    }, []);

    useEffect(() => {
        props.setType('');
        setType('');
    }, [name]);

    return (
        <Form.Select
            id={CONSTANTS.PLOT_TYPE_FORM}
            label={'Plot Type'}
            value={type}
            placeholder={'Plot Type'}
            options={PLOT_TYPE_OPTIONS}
            disabled={props.disabled}
            onChange={handleChange}
            fluid search
        />
    );
}

PlotTypeDropdown.propTypes = {
    type: PropTypes.string,
    setType: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    resetDependencies: PropTypes.func.isRequired,
};