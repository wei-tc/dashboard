import {render} from "react-dom";
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Divider, Form, Grid, Header, Icon, Menu, Popup, Segment} from "semantic-ui-react";
import {
    filterStandardsBySelected,
    patchPlot,
    sortAlphanumerically,
    sortPlotDataAlphanumericallyByName
} from "./data/transform";
import {fetchAllDatasets, fetchAllPlotData, fetchToJson} from "./data/fetch";
import {CONSTANTS} from "./plot/constants";
import {PlotWrapper} from "./components/plot_wrapper";
import {ManagementHelp} from "./components/help/management";
import {ALL_PLOTS_URL, ALL_USERS_URL, DATASETS_URL, STANDARDS_URL} from "./api";
import {PLOT_PADDING} from "./components/client_plot";

function ManagementForm() {
    const [allUserPlotData, setAllUserPlotData] = useState({});
    const [usernames, setUsernames] = useState([]);

    const [selectedUser, setSelectedUser] = useState('');
    const [userPlotNames, setUserPlotNames] = useState([]);
    const [preview, setPreview] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);
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
        setPreview([]);
        setPreviewLoading(false);
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
        setPreviewLoading(false);
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
        setPreviewLoading(false);
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

    const loadPreview = useCallback(async () => {
        let plotData = allUserPlotData[selectedUser].plot;

        const datasets = fetchAllDatasets(DATASETS_URL, plotData);
        const allStandards = await fetchStandards(STANDARDS_URL);

        plotData = sortAlphanumerically(plotData, 'name');

        const previewPlots = [];
        for (let p = 0; p < plotData.length; p++) {
            const plot = plotData[p];
            const plotStandards = plot[CONSTANTS.SETTINGS][CONSTANTS.INDUSTRY_STANDARDS_FORM];
            const standards = filterStandardsBySelected(allStandards, plotStandards);
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
        setPreviewLoading(false);
    }, [selectedUser, preview, scrollDown, allUserPlotData]);

    const handlePreview = useCallback((e, selected) => {
        if (preview.length === 0) {
            setPreviewLoading(true);
            loadPreview()
        } else {
            scrollDown();
        }
    }, [preview, loadPreview, scrollDown]);

    const scrollDown = useCallback(async () => {
        await new Promise(r => setTimeout(r, 1)); // without trivial timeout, scrollTo abruptly stops mid-scroll
        window.scrollTo({top: previewContainer.current.offsetTop - PLOT_PADDING, left: 0, behavior: 'smooth'})
    }, [previewContainer]);

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
                scrollTop.css('position', 'fixed');
                scrollTop.css('position', '-webkit-sticky');
            }
        });
    }, [preview]);

    return (
        <>
            <Grid columns={'equal'} padded>
                <Grid.Column className={'data-column'} mobile={3} tablet={3} computer={5}>
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

                <Grid.Column className={'data-column'} mobile={7} tablet={7} computer={6}>
                    <Segment className={'data-header'} attached={'top'}>
                        Allocated Plots<Button className={'preview'} icon={'eye'} content={'Preview'}
                                               loading={previewLoading} compact
                                               size={'small'} onClick={handlePreview}
                                               disabled={userPlotNames.length === 0}
                                               active={preview.length > 0} color={preview.length > 0 ? 'olive' : null}/>
                    </Segment>
                    <Segment.Group className={'scroll'} attached={'bottom'}>
                        {userPlotNames.length === 0 && <Segment className={'no-data'} placeholder>
                            <Header icon>
                                <Icon name={'search'}/>Select a user with allocated plots
                            </Header>
                        </Segment>}

                        {userPlotNames.map(name => (
                            <Menu className={'data-row'}
                                  key={`${selectedUser}-${name}`}
                                  fluid
                                  size={'huge'}
                                  borderless>
                                <Menu.Item className={'remove'}
                                    onClick={handleRemoveClick(name)}>
                                    <Icon name={'remove'}/>
                                </Menu.Item>
                                <Menu.Item name={name} active={false} content={name}/>
                            </Menu>))}
                    </Segment.Group>
                </Grid.Column>

                <Grid.Column className={'data-column'} mobile={6} tablet={6} computer={5}>
                    <Segment className={'data-header'} attached={'top'}>
                        All Plots
                        <Popup flowing position={'top right'}
                               trigger={<Button className={'filter'} icon={'filter'} content={'Filter'} toggle compact
                                                size={'small'}/>}
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
                            <Menu className={'data-row'}
                                  key={`${name}`}
                                  fluid
                                  size={'huge'}
                                  borderless>
                                <Menu.Item className={'add'}
                                    onClick={handleAddClick(name)}>
                                    <Icon name={'add'}/>
                                </Menu.Item>
                                <Menu.Item name={name} active={false} content={name}/>
                            </Menu>))}
                    </Segment.Group>
                </Grid.Column>
            </Grid>

            <div ref={previewContainer} id='client-view'>
                {preview.length > 0 && <Divider horizontal><Header>PREVIEW</Header></Divider>}
                {preview.length > 0 && preview.map(p => (
                    <Segment className={'plot-container'} key={p.title} attached={'bottom'}>
                        <PlotWrapper
                            title={p.title}
                            standards={p.standards}
                            dataset={p.dataset}
                            type={p.type}
                            settings={p.settings}
                            displayable={true}/>
                    </Segment>
                ))}
                {preview.length > 0 &&
                <Button id={'scroll-top'} className={'scroll-top'} icon circular size={'large'} onClick={scrollUp}>
                    <Icon name={'angle double up'}/>
                </Button>}
            </div>
        </>
    );
}

render(
    <ManagementForm/>,
    document.getElementById('management-form')
);
