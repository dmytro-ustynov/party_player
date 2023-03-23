import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import React, {useState} from "react";
import {Tabs, Typography, Divider} from "@mui/material";
import Tab from "@mui/material/Tab";
import ListIcon from "@mui/icons-material/List";
import FileInfo from "./FileInfo";
import TagIcon from '@mui/icons-material/Tag';
import HistoryIcon from '@mui/icons-material/History';


const drawerWidth = "35%"

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            className="side-tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 0.1,}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function populateProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function SideTab(props) {
    const {info} = props
    // const [openTab, setOpenTab] = useState(false)
    const [tabValue, setTabValue] = useState(0)

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <nav style={{width: drawerWidth, flexShrink: 0,}}>
            <Box
                sx={{flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: "50vh"}}
            >
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Vertical tabs example"
                    sx={{borderRight: 1, borderColor: 'divider', width: '80px'}}
                >
                    <Tab label={<ListIcon/>} {...populateProps(0)} />
                    <Tab label={<TagIcon/>} {...populateProps(1)} />
                    <Tab label={<HistoryIcon/>} {...populateProps(2)} />
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    <FileInfo info={info}/>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h5"> Tags</Typography>
                    <Divider/>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h5"> Change history </Typography>
                    <Divider/>
                </TabPanel>
            </Box>
        </nav>
    )
}