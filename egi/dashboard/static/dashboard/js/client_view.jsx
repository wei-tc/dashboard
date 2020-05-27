import {fetchAllDatasets, fetchAllPlotData} from './data/fetch';
import {CONSTANTS} from './plot/constants';

import React, {useCallback, useEffect, useState} from 'react';
import {render} from 'react-dom';
import {fetchAllStandardsThenToDropdownOptions, filterStandardsBySelected, isObjEmpty} from './data/transform';
import {TabView} from './components/tab_view';
import {Tab} from 'semantic-ui-react';
import {ALL_PLOTS_URL, DATASETS_URL, STANDARDS_URL} from "./api";

const ClientPlotsView = () => {
    const [allPlotData, setAllPlotData] = useState([]);
    const [allStandards, setStandards] = useState([]);
    const [datasets, setDatasets] = useState({});
    const [panes, setPanes] = useState([]);

    useEffect(() => {
        fetchAllPlotData(ALL_PLOTS_URL)
            .then(p => setAllPlotData(p))
            .catch(e => console.error(e));

        fetchAllStandardsThenToDropdownOptions(STANDARDS_URL)
            .then(s => setStandards(s))
            .catch(e => console.error(e));
    }, []);

    useEffect(() => {
        if (allPlotData.length === 0) {
            return;
        }

        const promisedDatasets = fetchAllDatasets(DATASETS_URL, allPlotData);
        awaitThenSetDatasets(promisedDatasets);
    }, [allPlotData]);

    const awaitThenSetDatasets = useCallback(async (promisedDatasets) => {
        const resolvedDatasets = {};
        for (const [name, dataset] of Object.entries(promisedDatasets)) {
            resolvedDatasets[name] = await dataset;
        }

        setDatasets(resolvedDatasets);
    }, []);

    useEffect(() => {
        if (isObjEmpty(datasets) || allPlotData.length === 0) {
            return;
        }

        const propsOfPlotsByDataset = {};

        for (let i = allPlotData.length - 1; i >= 0; i--) {
            const plot = allPlotData[i];
            const plotStandards = plot[CONSTANTS.SETTINGS][CONSTANTS.INDUSTRY_STANDARDS_FORM];
            const filteredStandards = filterStandardsBySelected(allStandards, plotStandards);
            const name = plot.dataset;
            const props = toPlotComponentProp(plot, filteredStandards, datasets[name]);
            (propsOfPlotsByDataset[name] = propsOfPlotsByDataset[name] || []).push(props);
        }

        const newPanes = Object.entries(propsOfPlotsByDataset).map(([name, propsOfPlots]) => ({
            menuItem: name,
            render: () => <Tab.Pane attached={false}>
                <TabView key={name} standards={allStandards} propsOfPlots={propsOfPlots}/>
            </Tab.Pane>
        }));

        setPanes(newPanes);

    }, [allStandards, datasets]);

    const toPlotComponentProp = useCallback((plot, fetchedStandards, fetchedDataset) => {
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
    }, []);

    return (
        <>
            <Tab menu={{pointing: false, attached: false, tabular: true}} panes={panes}/>
        </>
    );
};

render(
    <ClientPlotsView/>,
    document.getElementById('client-plots')
);
