import React, {useCallback, useEffect, useState} from "react";
import {fetchDataset} from "../../data/fetch";
import {toDict} from "../../data/transform";
import {Form} from "semantic-ui-react";
import {CONSTANTS} from "../../plot/constants";
import PropTypes from "prop-types";

export function DatasetDropdown(props) {
    const [datasets, setDatasets] = useState([]);

    const fetchAllDatasetInfo = useCallback(async () => {
        const response = await fetch(props.url);
        const json = await response.json();
        const options = await json.map(d => ({
            value: d.name,
            text: `${d.name}: ${d.description}`
        }));
        setDatasets(options);
    }, []);

    useEffect(() => {
        fetchAllDatasetInfo();
    }, []);

    const handleChange = useCallback((e, selected) => {
        const name = selected.value;
        fetchDataset(`${props.url}/${name}`)
            .then(dataset => props.setDataset({
                name: name,
                data: toDict(dataset)
            }))
            .catch(err => console.error(err));

        props.resetDependencies();
    }, []);

    return (
        <Form.Select
            id={CONSTANTS.DATASET_NAME_FORM}
            label={'Dataset'}
            placeholder={'Dataset'}
            options={datasets}
            disabled={props.disabled}
            onChange={handleChange}
            fluid search
        />
    );
}

DatasetDropdown.propTypes = {
    url: PropTypes.string.isRequired,
    setDataset: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    resetDependencies: PropTypes.func.isRequired
};