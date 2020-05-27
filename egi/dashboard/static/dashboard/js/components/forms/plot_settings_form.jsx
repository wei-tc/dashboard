import React, {useEffect, useState} from "react";
import {BarSettings} from "./plot_settings_forms/bar_settings";
import {StackedBarSettings} from "./plot_settings_forms/stacked_bar_settings";
import {BoxSettings} from "./plot_settings_forms/box_settings";
import {GeographicalSettings} from "./plot_settings_forms/geographical_settings";
import {PieSettings} from "./plot_settings_forms/pie_settings";
import {ScatterSettings} from "./plot_settings_forms/scatter_settings";
import {TimeSeriesSettings} from "./plot_settings_forms/timeseries_settings";
import PropTypes from "prop-types";

export function PlotSettingsForm(props) {
    const [settingsForm, setSettingsForm] = useState(null);

    useEffect(() => {
        switch (props.type) {
            case 'Bar':
                setSettingsForm(<BarSettings disabled={props.disabled}/>);
                break;
            case 'Stacked Bar':
                setSettingsForm(<StackedBarSettings disabled={props.disabled}/>);
                break;
            case 'Box':
                setSettingsForm(<BoxSettings disabled={props.disabled}/>);
                break;
            case 'Geographical':
                setSettingsForm(<GeographicalSettings disabled={props.disabled}/>);
                break;
            case 'Pie':
                setSettingsForm(<PieSettings disabled={props.disabled}/>);
                break;
            case 'Scatter':
                setSettingsForm(<ScatterSettings disabled={props.disabled}/>);
                break;
            case 'Time Series':
                setSettingsForm(<TimeSeriesSettings disabled={props.disabled}/>);
                break;
            default: // pass
                setSettingsForm('');
                break;
        }
    }, [props.type, props.disabled]);

    return (
        <>
            {settingsForm}
        </>
    );
}

PlotSettingsForm.propTypes = {
    type: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};