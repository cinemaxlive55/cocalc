{React, ReactDOM, rclass} = require('./smc-react')

{Alert, Button, ButtonToolbar, ButtonGroup, Input, Row, Col,
    Panel, Popover, Tabs, Tab, Well} = require('react-bootstrap')

{HelpPage} = require('./r_help')

Page = rclass
    displayName : "Page"
    render : ->
        <div>
            <Tabs animation={false}>
                <Tab eventKey={'projects'} title={"Projects"}>
                    <Projects />
                </Tab>
                <Tab eventKey={'activity'} title={"Activity"}>
                    <Activity />
                </Tab>
                <Tab eventKey={'account'} title={"Account"}>
                </Tab>
                <Tab eventKey={'about'} title={"About"}>
                    <HelpPage />
                </Tab>
                <Tab eventKey={'support'} title={"Support"}>
                </Tab>
                <Tab eventKey={'network'} title={"Network"}>
                </Tab>
            </Tabs>
       </div>

Projects = rclass
    render : ->
        <div>
            <h1>Your Projects...</h1>
        </div>

Activity = rclass
    render : ->
        <div>
            <h1>Activity...</h1>
        </div>

$('body').css('padding-top':0).append('<div class="page-container smc-react-container"></div>')
page = <Page/>
ReactDOM.render(page, $(".smc-react-container")[0])
