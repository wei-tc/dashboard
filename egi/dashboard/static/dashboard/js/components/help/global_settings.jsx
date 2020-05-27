import React from "react";
import {Button, Header, Icon, Modal} from "semantic-ui-react";

const CLIENT_VIEW_TEXT = <p>When you log in you will see displayed the default plots pre-selected for your username.
    You can modify display settings using the buttons and drop downs on the right. Different datasets will display on
    different tabs. If you only have one dataset you won’t see any tabs. Refresh the web page to reset to the default
    view.</p>;
const GLOBAL_SETTINGS_TEXT = <p>From here you can select what is displayed for all your plots, without having to change
    each plot individually. When you switch this on you will be able to select the factors you wish to display.
    Switch it off again to revert to default view.</p>;
const PLOTS_TEXT = <p>Hover your mouse over the plots to display information.
    Some plots will allow you to select areas by drawing a box around them, you can also save the plot as an image,
    or zoom in and out using the scrolling wheel. Experiment with the different options.
    There is a reset axes button to return to the default view.
    The default view will likely display a list of items in the legend.
    Single-click on a legend entry to remove that series from the plot display.
    Single-click on it again to return it to the display.
    With all the items showing, double-click on an item to only display that item
    (remove all other items from displaying on the plot).
</p>;
const CONTROLS_TEXT = <p>On the right are the plot control options:<br/><br/>
    <strong>Title:</strong> Here you can enter a new title for the plot (text only)<br/>
    <strong>Filter by Column (Optional):</strong> Select a column to filter by, Location will be a common one. When you
    select a filter column the next drop-down will be displayed 'Now select column values to filter by'. Select the
    locations (or other values) you wish to display in your plot.<br/>
    <strong>Filter by Time (Optional):</strong> Select the time range you wish to filter by, by year or year range,
    month range or by date range.<br/>
    <strong>X axis, Y axis:</strong> Select the variables to plot on the x axis (horizontal) and y axis (vertical).<br/>
    <strong>Linear/log:</strong> Choose whether you want a logarithmic or linear scale on the axis (remember zero values
    will not plot on log scales).<br/>
    <strong>Group By (Optional):</strong> If you have categorical data in some of your data
    (rather than numerical values) you can use this to display your data grouped by category.
    This allows you to group your data according to a secondary factor, experiment with this one.<br/>
    <strong>Aggregation Type:</strong> This allows the data to be summarised by maximum, minimum, median,
    mean or no aggregation (None). This will be most useful in summary plots (e.g. bar charts) and spatial plots (maps).
    These functions won’t be very meaningful for time series plots unless multiple values are recorded with the same
    date information. There is also an option to display only the most recent values using the ‘Last’ option.<br/>
    <strong>Spatial plots, Scatter plots: Marker size:</strong> The data is displayed as points on the aerial imagery,
    if you want to scale the size of the marker according to the relative magnitude of the value (i.e. large values
    give large markers, small values give small markers.) Just select which parameter you wish to base the scaling
    on.<br/>
    <strong>Box and whisker plot; Mean, Median and Outlier Handling:</strong> Box plots allow options to display points
    outside the whiskers (outliers) exclude them, or display additional factors including the standard deviation and
    means.</p>;


export function GlobalSettingsHelp() {
    return (
        <>
            <Modal closeIcon
                   trigger={<Button color={'olive'} circular icon floated={'right'}><Icon name={'help'}/></Button>}>
                <Modal.Header>
                    <Icon bordered circular color={'olive'} name={'help'} size={'small'}/>
                    &nbsp;Help
                </Modal.Header>
                <Modal.Content scrolling>
                    <Modal.Description>
                        <Header content={'Client View'}/>
                        {CLIENT_VIEW_TEXT}
                        <Header content={'Global Settings'}/>
                        {GLOBAL_SETTINGS_TEXT}
                        <Header content={'Plots'}/>
                        {PLOTS_TEXT}
                        <Header content={'Controls'}/>
                        {CONTROLS_TEXT}
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        </>
    );
}
