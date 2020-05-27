import {render} from "react-dom";
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Divider, Form, Grid, Header, Icon, Popup, Segment} from "semantic-ui-react";
import {
    filterStandardsBySelected,
    patchPlot,
    sortAlphanumerically,
    sortPlotDataAlphanumericallyByName
} from "./data/transform";
import {fetchAllDatasets, fetchAllPlotData, fetchToJson} from "./data/fetch";
import {CONSTANTS} from "./plot/constants";
import {Plot} from "./components/plot";
import {ManagementHelp} from "./components/help/management";
import {ALL_PLOTS_URL, ALL_USERS_URL, DATASETS_URL, STANDARDS_URL} from "./api";

function ManagementForm() {
    const [allUserPlotData, setAllUserPlotData] = useState({});
    const [usernames, setUsernames] = useState([]);

    const [selectedUser, setSelectedUser] = useState('');
    const [userPlotNames, setUserPlotNames] = useState([]);
    const [preview, setPreview] = useState([]);
    const previewContainer = useRef(null);

    const [allPlots, setAllPlots] = useState([]);
    const [filteredPlotNames, setFilteredPlotNames] = useState([]);
    const [filter, setFilter] = useState([]);

    useEffect(() => {
        fetchToJson(ALL_USERS_URL).then(allUserData => {
            const data = allUserData.reduce((acc, userPlotData) => {
                const plots = userPlotData.plot.map(p => ({
                    ...p,
                    [CONSTANTS.SETTINGS]: JSON.parse(p[CONSTANTS.SETTINGS])
                }));

                acc[userPlotData.username] = userPlotData;
                acc[userPlotData.username].plot = plots;
                return acc;
            }, {});

            setAllUserPlotData(data);

            setUsernames(sortAlphanumerically(allUserData.map(u => u.username)));
        });
    }, []);

    const handleUserClick = useCallback((username) => async (e, selected) => {
        if (selectedUser === username) {
            setSelectedUser('');
            setUserPlotNames([]);
        } else {
            setSelectedUser(username);
            const plotNames = allUserPlotData[username].plot.map(p => p.name);
            setUserPlotNames(sortAlphanumerically(plotNames));
        }
        setPreview(false);
    }, [allUserPlotData, selectedUser]);

    useEffect(() => {
        fetchToJson(ALL_PLOTS_URL)
            .then(data => {
                const plots = data.map(p => ({name: p.name, dataset: p.dataset}));
                const sorted = sortPlotDataAlphanumericallyByName(plots);

                setAllPlots(sorted);
                setFilteredPlotNames(sorted.map(p => p.name));
            });
    }, []);

    const updateUserPlotData = useCallback((updatedUserPlotData) => {
        const updated = allUserPlotData[selectedUser];
        updated.plot = updatedUserPlotData;

        setAllUserPlotData(userPlotData => ({
            ...userPlotData,
            [selectedUser]: updated
        }));
    }, [allUserPlotData, selectedUser]);

    const handleRemoveClick = useCallback((plotName) => async (e, selected) => {
        const url = `${ALL_USERS_URL}/${selectedUser}/`;
        const remainingPlots = userPlotNames.filter(name => name !== plotName);
        const data = {'plot': remainingPlots};
        await patchPlot(data, url);

        const updatedUserPlotData = await fetchAllPlotData(`${ALL_USERS_URL}/${selectedUser}`);

        setUserPlotNames(sortAlphanumerically(updatedUserPlotData.map(p => p.name)));
        updateUserPlotData(updatedUserPlotData);
        setPreview([]);
    }, [userPlotNames, selectedUser, updateUserPlotData]);

    const handleAddClick = useCallback((plotName) => async (e, selected) => {
        if (selectedUser.length === 0) {
            return;
        }

        const url = `${ALL_USERS_URL}/${selectedUser}/`;
        const updatedPlots = [...userPlotNames, plotName];
        const data = {'plot': updatedPlots};
        await patchPlot(data, url);

        const updatedUserPlotData = await fetchAllPlotData(`${ALL_USERS_URL}/${selectedUser}`);

        setUserPlotNames(sortAlphanumerically(updatedUserPlotData.map(p => p.name)));
        updateUserPlotData(updatedUserPlotData);
        setPreview([]);
    }, [userPlotNames, selectedUser, updateUserPlotData]);

    const handleFilter = useCallback((e, datasets) => {
        setFilter(datasets.value);
        if (datasets.value.length > 0) {
            const filteredPlots = allPlots.filter(p => datasets.value.includes(p.dataset));
            setFilteredPlotNames(filteredPlots.map(p => p.name));
        } else { // set to empty when deleted
            setFilteredPlotNames(allPlots.map(p => p.name));
        }
    }, [allPlots]);

    /**
     * [{name: standard name, standard: {(chemical: number)*}}*]
     * @param url
     * @returns {Promise<{}>}
     */
    const fetchStandards = async (url) => {
        const json = await fetchToJson(url);
        return json.map(({name, standard}) => ({
            name: name,
            standard: JSON.parse(standard)
        }));
    };

    const handlePreview = useCallback(async (e, selected) => {
        if (selectedUser.length === 0) {
            return;
        }
        if (preview.length > 0) {
            scrollDown();
            return;
        }

        const plotData = allUserPlotData[selectedUser].plot;

        const datasets = fetchAllDatasets(DATASETS_URL, plotData);
        const allStandards = await fetchStandards(STANDARDS_URL);

        const previewPlots = [];

        for (let p = plotData.length - 1; p >= 0; p--) {
            const plot = plotData[p];
            const plotStandards = plot[CONSTANTS.SETTINGS][CONSTANTS.INDUSTRY_STANDARDS_FORM];
            const standards = filterStandardsBySelected(await allStandards, plotStandards);
            const fetchedDataset = await datasets[plot.dataset];

            previewPlots.push({
                title: plot.name,
                type: plot[CONSTANTS.PLOT_TYPE],
                dataset: {name: plot.dataset, data: fetchedDataset},
                standards: standards,
                settings: plot[CONSTANTS.SETTINGS],
            });
        }

        setPreview(previewPlots);
    }, [selectedUser, preview, scrollDown, allUserPlotData]);

    const scrollDown = useCallback(() => {
        window.scrollTo({top: previewContainer.current.offsetTop, left: 0, behavior: 'smooth'})
    }, []);

    useEffect(() => {
        if (preview.length > 0) {
            scrollDown();
        }
    }, [preview, scrollDown]);

    const scrollUp = useCallback((e, selected) => {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
    }, []);

    useEffect(() => {
        $(window).scroll(function () {
            const scrollTop = $('#scroll-top');
            if ($(window).scrollTop() < $('#management-form').offset().top) {
                scrollTop.css('position', 'relative');
                scrollTop.css('bottom', '17px');
            } else {
                scrollTop.css('position', 'sticky');
                scrollTop.css('position', '-webkit-sticky');
            }
        });
    }, [preview]);

    return (
        <>
            <Grid columns={'equal'} padded>
                <Grid.Column className={'data-column'}>
                    <Segment className={'data-header'} attached={'top'}>
                        Users<ManagementHelp/>
                    </Segment>
                    <Segment.Group className={'scroll'} attached={'bottom'}>
                        {usernames.map(username => (
                            <Segment className={'data-row'}
                                     key={username}
                                     inverted={selectedUser === username}
                                     color={selectedUser === username ? 'olive' : undefined}
                                     onClick={handleUserClick(username)}>
                                {username}
                            </Segment>))}
                    </Segment.Group>
                </Grid.Column>

                <Grid.Column className={'data-column'}>
                    <Segment className={'data-header'} attached={'top'}>
                        Allocated Plots<Icon name={'eye'} onClick={handlePreview}/>
                    </Segment>
                    <Segment.Group className={'scroll'} attached={'bottom'}>
                        {userPlotNames.length === 0 && <Segment className={'no-data'} placeholder>
                            <Header icon>
                                <Icon name={'search'}/>Select a user with allocated plots
                            </Header>
                        </Segment>}

                        {userPlotNames.map(name => (
                            <Segment className={'data-row'}
                                     key={`${selectedUser}-${name}`}>
                                {name}<Icon name={'remove'}
                                            onClick={handleRemoveClick(name)}/>
                            </Segment>))}
                    </Segment.Group>
                </Grid.Column>

                <Grid.Column className={'data-column'}>
                    <Segment className={'data-header'} attached={'top'}>
                        All Plots
                        <Popup flowing position={'top right'}
                               trigger={<Button className={'filter'} toggle compact size={'small'}>Filter</Button>}
                               on={'click'}>
                            <Form.Select
                                placeholder={'Filter by dataset name'}
                                options={[...new Set(allPlots.map(p => p.dataset))].map(d => ({value: d, text: d}))}
                                value={filter}
                                onChange={handleFilter}
                                multiple clearable search
                            />
                        </Popup>
                    </Segment>
                    <Segment.Group className={'scroll'} attached={'bottom'}>
                        {allPlots.length === 0 && <Segment className={'no-data'} placeholder>
                            <Header icon>
                                <Icon name={'chart bar'}/>Created plots will display here
                            </Header>
                        </Segment>}

                        {filteredPlotNames.length === 0 && <Segment className={'no-data'} placeholder>
                            <Header icon>
                                <Icon name={'search'}/>No plots found
                            </Header>
                        </Segment>}

                        {filteredPlotNames.map(name => (
                            <Segment className={'data-row'}
                                     key={name}>
                                {name}<Icon name={'add'}
                                            onClick={handleAddClick(name)}/>
                            </Segment>))}
                    </Segment.Group>
                </Grid.Column>
            </Grid>

            <div ref={previewContainer} id='client-view'/>
            {preview.length > 0 && <Divider horizontal><Header>PREVIEW</Header></Divider>}
            {preview.length > 0 && preview.map(p => (
                <Segment className={'plot-container'} key={p.title} attached={'bottom'}>
                    <Plot
                        title={p.title}
                        standards={p.standards}
                        dataset={p.dataset}
                        type={p.type}
                        settings={p.settings}
                        displayable={true}/>
                </Segment>
            ))}
            {preview.length > 0 && <Icon id={'scroll-top'} className={'scroll-top'}
                                         inverted color={'olive'}
                                         circular name={'angle double up'} size={'large'}
                                         onClick={scrollUp}/>}
        </>
    );
}

render(
    <ManagementForm/>,
    document.getElementById('management-form')
);
