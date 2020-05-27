import React, {useCallback, useState} from 'react';
import {Form, Grid, Message, Radio, Segment} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import {ClientPlot} from './client_plot';
import {ColumnFilterDropdown} from './forms/column_filter_dropdown';
import {TimeFilterDropdown} from './forms/time_filter_dropdown';
import {IndustryStandardsDropdown} from "./forms/industry_standards_dropdown";
import {GlobalSettingsHelp} from "./help/global_settings";
import {DatasetContext} from "../context";

const INSTRUCTIONS = <p>
    Global settings override the corresponding settings for all plots in this tab.<br/>
    To restore the corresponding setting for all plots in this tab, click X on the right of the tab setting
    dropdown.<br/>
    To restore all settings, refresh the page.
</p>;

export function TabView(props) {
    const [tabStandards, setTabStandards] = useState({});
    const [tabColumnFilter, setTabColumnFilter] = useState({});
    const [tabTimeFilter, setTabTimeFilter] = useState('');
    const [tabTimeFilterRange, setTabTimeFilterRange] = useState({});
    const [displayTabDropdowns, setDisplayTabDropdowns] = useState(false);

    const handleTabDropdowns = useCallback((e, selected) => {
        setDisplayTabDropdowns(selected.checked);
        if (!selected.checked) {
            setTabStandards({});
            setTabColumnFilter({});
            setTabTimeFilter('');
            setTabTimeFilterRange({});
        }
    }, []);

    // dataset-plots is 1-M relationship
    return (
        <>
            <Segment raised>
                <Grid>
                    <Grid.Column floated='left' width={5}>
                        <Radio toggle label={'Global Settings'} onChange={handleTabDropdowns}/>
                    </Grid.Column>
                    <Grid.Column floated='right' width={5}>
                        <GlobalSettingsHelp/>
                    </Grid.Column>
                </Grid>
                {displayTabDropdowns && <Form>
                    <DatasetContext.Provider value={props.propsOfPlots[0].dataset}>
                        <Message id={'global-settings-instructions'} content={INSTRUCTIONS}/>
                        <IndustryStandardsDropdown standards={props.standards} setStandards={setTabStandards}/>
                        <ColumnFilterDropdown columnFilter={''} setColumnFilter={setTabColumnFilter}/>
                        <TimeFilterDropdown timeFilter={tabTimeFilter} timeFilterRange={{}}
                                            setTimeFilter={setTabTimeFilter}
                                            setTimeFilterRange={setTabTimeFilterRange}/>
                    </DatasetContext.Provider>
                </Form>}
            </Segment>
            < Grid
                id={'plot-grid'}
                stackable>
                {
                    props.propsOfPlots.map(p => <ClientPlot key={p.title}
                                                            dataset={props.propsOfPlots[0].dataset}
                                                            plotProps={p}
                                                            tabStandards={tabStandards}
                                                            tabColumnFilter={tabColumnFilter}
                                                            tabTimeFilter={tabTimeFilter}
                                                            tabTimeFilterRange={tabTimeFilterRange}/>)
                }
            </Grid>
        </>
    )
}

TabView.propTypes = {
    standards: PropTypes.arrayOf(PropTypes.object).isRequired,
    propsOfPlots: PropTypes.arrayOf(PropTypes.object).isRequired,
};