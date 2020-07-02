import {fetchAllDatasets, fetchAllPlotData} from './data/fetch';
import {CONSTANTS} from './plot/constants';

import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import {
    fetchAllStandardsThenToDropdownOptions,
    filterStandardsBySelected,
    sortAlphanumerically
} from './data/transform';
import {TabView} from './components/tab_view';
import {Dimmer, Loader, Tab} from 'semantic-ui-react';
import {ALL_PLOTS_URL, DATASETS_URL, STANDARDS_URL} from "./api";

const ClientPlotsView = () => {
    const [panes, setPanes] = useState([{
        menuItem: 'Loading...',
        pane: <Tab.Pane key={'loading'} className={'loading-pane'}>
            <Dimmer inverted active >
                <Loader size={'massive'}/>
            </Dimmer>
        </Tab.Pane>
    }]);

    useEffect(() => {
        loadPanes()
            .catch(e => console.error(e));
    }, []);

    const loadPanes = async () => {
        const promisedStandards = fetchAllStandardsThenToDropdownOptions(STANDARDS_URL);
        const allPlotData = await fetchAllPlotData(ALL_PLOTS_URL);
        const promisedDatasets = fetchAllDatasets(DATASETS_URL, allPlotData);

        const allStandards = await promisedStandards;

        let propsOfPlotsByDataset = {};
        for (let i = 0; i < allPlotData.length; i++) {
            const plot = allPlotData[i];
            const plotStandards = plot[CONSTANTS.SETTINGS][CONSTANTS.INDUSTRY_STANDARDS_FORM];
            const filteredStandards = filterStandardsBySelected(allStandards, plotStandards);
            const name = plot.dataset;
            const props = toPlotComponentProp(plot, filteredStandards, await promisedDatasets[name]);
            (propsOfPlotsByDataset[name] = propsOfPlotsByDataset[name] || []).push(props);
        }

        const sortedDatasetNames = sortAlphanumerically(Object.keys(propsOfPlotsByDataset));
        const newPanes = sortedDatasetNames.map(name => ({
            menuItem: name,
            pane: <Tab.Pane key={name} className={'tab-pane'}>
                <TabView standards={allStandards} propsOfPlots={sortAlphanumerically(propsOfPlotsByDataset[name], 'title')}/>
            </Tab.Pane>
        }));

        setPanes(newPanes);
    };

    const toPlotComponentProp = (plot, fetchedStandards, fetchedDataset) => {
        const settings = plot[CONSTANTS.SETTINGS];
        return {
            title: plot.name,
            standards: fetchedStandards,
            dataset: {
                name: plot.dataset,
                data: fetchedDataset
            },
            type: plot[CONSTANTS.PLOT_TYPE],
            columnFilter: {
                [CONSTANTS.COL_FILTER_NAME]: settings[CONSTANTS.COL_FILTER_NAME],
                [CONSTANTS.COL_FILTER_VALUES]: settings[CONSTANTS.COL_FILTER_VALUES]
            },
            timeFilter: settings[CONSTANTS.TIME_FILTER_NAME],
            timeFilterRange: {
                [CONSTANTS.TIME_FILTER_START]: settings[CONSTANTS.TIME_FILTER_START],
                [CONSTANTS.TIME_FILTER_END]: settings[CONSTANTS.TIME_FILTER_END]
            },
            settings: settings,
            aggregationType: plot[CONSTANTS.AGGREGATION_TYPE]
        };
    };

    return (
        <>
            <Tab menu={{pointing: false, attached: true, tabular: true}} panes={panes} renderActiveOnly={false}/>
        </>
    );
};

render(
    <ClientPlotsView/>,
    document.getElementById('client-plots')
);
