import Footer from "../components/Footer";
import Header from "../components/Header";

import React, {useEffect, useState} from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AccountInfo from "../components/auth/AccountInfo";
import {Roles, useAuthState} from "../components/auth/context";
import Link from "@mui/material/Link";
import {Button, Stack} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
// import {useAuthState} from "../components/auth/context";
// import {AccountInfo} from "../components/auth/AccountInfo";

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <div>{children}</div>
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

export default function ProfilePage() {
    const [value, setValue] = useState(0);
    const state = useAuthState()
    const user = state.user

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (user.role === Roles.ANONYMOUS) {
            window.location ='/login'
        }
        document.title = 'SounDream | Profile'
    }, [])

    return (
        <>
            <Header/>{user.role === Roles.ANONYMOUS ? <div className="content"><Link href={'login'}>Login</Link></div> :
            <div className='content'>
                <Stack direction="row" spacing={6} sx={{justifyContent:"center"}} >
                    <Typography variant="h4">{user.firstname} {user.lastname}</Typography>
                    <Button startIcon={<EditIcon/>} variant="outlined">
                        Efit profile
                    </Button>
                </Stack>

                <Box
                    sx={{flexGrow: 1,
                        bgcolor: 'background.paper',
                        display: 'flex', height: '80vh'}}
                >
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        aria-label="Vertical tabs example"
                        sx={{borderRight: 1, borderColor: 'divider'}}
                    >
                        <Tab label="Account Settings" {...populateProps(0)} />
                        <Tab label="Manage my files" {...populateProps(1)} />
                        <Tab label="Manage costs" {...populateProps(2)} />

                    </Tabs>
                    <TabPanel value={value} index={0}>
                        <AccountInfo />
                    </TabPanel>
                    <TabPanel value={value} index={1} >
                       <Typography variant="h6">Manage my files</Typography>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <Typography variant="h6">My costs and savings</Typography>
                    </TabPanel>

                </Box>

            </div>}
            <Footer/>
        </>
    )
}