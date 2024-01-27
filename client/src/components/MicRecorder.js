import React, {useState} from 'react';
import {
    Dialog,
    Grid,
    Paper,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";

import Snackbar from "@mui/material/Snackbar";
import VoiceRecorder from "./Microphone/voiceRecorder";

const MicRecorder = (props) => {
    const {styles} = props
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')

    return (
        <>
            <Grid item {...styles.grid}>
                <Paper {...styles.paper}>
                    <IconButton title={"Start recording"} onClick={() => setOpen(true)}>
                        <MicIcon {...styles.btn} />
                    </IconButton>
                </Paper>
            </Grid>
            <Dialog open={open} fullWidth>
                <VoiceRecorder setOpen={setOpen}/>
            </Dialog>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
        </>
    );
};

export default MicRecorder;