import {Button, Icon, Modal, Table} from "semantic-ui-react";
import React from "react";

export function ManagementHelp() {
    return (
        <>
            <Modal closeIcon size={'small'}
                   trigger={<Button className={'management-help'} color={'olive'} circular icon floated={'right'}>
                       <Icon name={'help'}/></Button>}>
                <Modal.Header>
                    <Icon bordered circular color={'olive'} name={'help'} size={'small'}/>
                    &nbsp;Assigning Plots to Users
                </Modal.Header>
                <Modal.Content scrolling>
                    <Modal.Description>
                        To assign a plot: click a user, click the plus next to a plot from "All Plots".
                        The plot name, type and the plots subset of data is chosen beforehand in the plot creation page.
                        <br/>
                        <br/>
                        <b>Some common issues are:</b>
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Issue</Table.HeaderCell>
                                    <Table.HeaderCell>Solution</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>I cannot see my user</Table.Cell>
                                    <Table.Cell>Users must be created by David. Contact him using the email
                                        below.</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>I cannot see plots assigned to a user</Table.Cell>
                                    <Table.Cell>Viewing user plots may take ~5/10 seconds to load depending on the
                                        number of plots</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>When viewing the plots for a user I can't see options for that
                                        plot</Table.Cell>
                                    <Table.Cell>On this page, you cannot see options for plots, only the plots
                                        themselves</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>I cannot see many plots</Table.Cell>
                                    <Table.Cell>You must make plots before you can assign them.
                                        Also check that you are not filtering the plots by a dataset or by name.
                                        The plots section is scrollable.</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                        <br/>
                        If you have issues or would like more functionality, feel free to contact David at&nbsp;
                        <a href={"mailto:david.faulkner@geochemistry.com.au"}>david.faulkner@geochemistry.com.au</a>.
                        Please note that response times may vary.
                        <br/>
                        David's primary role is not support for this application.
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        </>
    );
}