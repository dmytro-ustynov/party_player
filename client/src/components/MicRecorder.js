import React, {useState, useRef} from 'react';
import {
    Button, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Stack
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ReplayIcon from '@mui/icons-material/Replay';
import FileUploadIcon from "@mui/icons-material/FileUpload";
import MicIcon from "@mui/icons-material/Mic";
import {UPLOAD_FILE_URL} from "../utils/constants";

import {useAuthState} from "./auth/context";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";
import {fetcher} from "../utils/fetch_utils";
import Snackbar from "@mui/material/Snackbar";
import AudioVisualizer from "./micWave";

const MicRecorder = (props) => {
    const {styles} = props
    const [open, setOpen] = useState(false)
    const state = useAuthState()
    const {dispatch} = useAudioState()
    const user = state.user

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    // const [audioURL, setAudioURL] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [message, setMessage] = useState('')
    const mediaRecorderRef = useRef(null);
    // const audioRef = useRef(null);


    const handleStartRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.start();
        setIsRecording(true);
    };

    const handleDataAvailable = (e) => {
        const audioBlob = new Blob([e.data], {type: 'audio/webm'});
        // setAudioURL(URL.createObjectURL(audioBlob));
        setAudioBlob(audioBlob);

        setIsRecording(false);
        setIsPaused(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };



    const handleRecordAgain = () => {
        setIsRecording(false);
        setIsPaused(false);
        // setAudioURL('');
        setAudioBlob(null);
    }

    const handleUploadAudio = async () => {
        const formData = new FormData();
        const url = UPLOAD_FILE_URL + "?user_id=" + user.user_id
        const time = new Date()
        const filename = time.getTime().toString()
        formData.append('audiofile', audioBlob, `record_${filename}.webm`);
        const response = await fetcher({url, credentials: true, body: formData})
        if (response.result === true) {
            console.log('Audio uploaded successfully');
            dispatch({type: AudioAction.ADD_FILE, file: response.file})
            setOpen(false)
            setMessage('Record successfully uploaded')
        } else {
            console.log('Failed to upload audio');
            setMessage('Failed to upload record, try again')
        }
        console.log(response)
    };

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
                <DialogTitle>
                    <Stack direction="row" spacing={8}>
                        <span>RECORD</span>
                        <Chip label={<span className="on-air-label"><MicIcon size="small"/><>ON AIR</></span>}
                              color={isRecording && !isPaused ? "error" : "default"}/>
                    </Stack>
                </DialogTitle>
                <DialogContent>

                    <AudioVisualizer/>


                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRecordAgain}
                            startIcon={<ReplayIcon/>}
                            variant='contained'>
                        Record Again
                    </Button>
                    <Button
                            onClick={handleUploadAudio}
                            color='success'
                            variant="contained"
                            startIcon={<FileUploadIcon/>}>
                        Upload Audio
                    </Button>
                    <Button variant='contained'
                            onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
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