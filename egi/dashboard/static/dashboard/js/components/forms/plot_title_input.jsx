import React, {useCallback, useState} from "react";
import {Form, Input, Label} from "semantic-ui-react";
import {CONSTANTS, toId, VALID_HTML_ID_REGEX} from "../../plot/constants";
import PropTypes from "prop-types";

export function PlotTitleInput(props) {
    const [warning, setWarning] = useState(null);

    const handleChange = useCallback((e, input) => {
        if (!isValidTitle(input.value)) {
            const message = 'Title must begin with a letter, followed by any letters, numbers or :-_ symbols.';
            setWarning(<Label basic color={'red'} pointing>{message}</Label>);
        } else {
            setWarning(null);
        }

        props.setTitle(input.value);
    }, []);

    const isValidTitle = useCallback((title) => {
        if (!title) {
            return false;
        }

        const spaceFiltered = title.replace(/\s+/g, '');
        return VALID_HTML_ID_REGEX.test(spaceFiltered);
    }, []);

    return (
        <>
            <Form.Field>
                <label>Title</label>
                <Input id={`${CONSTANTS.PLOT_TITLE_FORM}-${toId(props.title)}`} placeholder={'Title'} value={props.title}
                       onChange={handleChange}/>
                {warning}
            </Form.Field>
        </>
    );
}

PlotTitleInput.propTypes = {
    setTitle: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
};