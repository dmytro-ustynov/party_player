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
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from "@mui/icons-material/Stop";
import PauseIcon from "@mui/icons-material/Pause";
import EjectIcon from '@mui/icons-material/Eject';
import {useAuthState} from "./auth/context";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";
import {fetcher} from "../utils/fetch_utils";

const MicRecorder = (props) => {
    const {styles} = props
    const [open, setOpen] = useState(false)
    const state = useAuthState()
    const {dispatch} = useAudioState()
    const user = state.user

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);


    const handleStartRecording = async () => {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.start();
    };

    const handleDataAvailable = (e) => {
        const audioBlob = new Blob([e.data], {type: 'audio/webm'});
        setAudioURL(URL.createObjectURL(audioBlob));
        setAudioBlob(audioBlob);

        setIsRecording(false);
        setIsPaused(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };

    const handlePauseRecording = () => {
        setIsPaused(true);
        mediaRecorderRef.current.pause();
    };

    const handleResumeRecording = () => {
        setIsPaused(false);
        mediaRecorderRef.current.resume();
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current.stop();
    };

    const handleRecordAgain = () => {
        setIsRecording(false);
        setIsPaused(false);
        setAudioURL('');
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
        } else {
            console.log('Failed to upload audio');
        }
        console.log(response)
    };

    return (
        <>
            <Grid item {...styles.gridProps}>
                <Paper {...styles.paperProps}>
                    <IconButton title={"Start recording"} onClick={() => setOpen(true)}>
                        <MicIcon {...styles.btnProps} />
                    </IconButton>
                </Paper>
            </Grid>
            <Dialog open={open} fullWidth>
                <DialogTitle>
                    <Stack direction="row" spacing={8}>
                        <span>RECORD</span>
                        <Chip label="ON AIR" color={isRecording && !isPaused ? "error" : "default"}/>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <div>
                        {!isRecording && !audioURL && (
                            <Button onClick={handleStartRecording}
                                    title="Start recording"
                                    variant='outlined'
                                    startIcon={<FiberManualRecordIcon color='error'/>}>
                                RECORD
                            </Button>
                        )}
                        {isRecording && (
                            <>
                                <Button disabled={isPaused}
                                        variant='outlined'
                                        title="Pause Recording"
                                        startIcon={<PauseIcon color='success'/>}
                                        onClick={handlePauseRecording}>
                                    Pause
                                </Button>
                                <Button disabled={!isPaused}
                                        variant='outlined'
                                        title="Resume Recording"
                                        startIcon={<EjectIcon sx={{transform: "rotate(90deg)"}}/>}
                                        onClick={handleResumeRecording}>
                                    Resume
                                </Button>
                                <Button variant="outlined"
                                        startIcon={<StopIcon color='error'/>}
                                        onClick={handleStopRecording}
                                        title="Finish Recording">
                                    STOP
                                </Button>
                            </>
                        )}
                        {audioURL && <audio ref={audioRef} src={audioURL} controls/>}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRecordAgain}
                            startIcon={<ReplayIcon/>}
                            variant='contained'>
                        Record Again
                    </Button>
                    <Button disabled={!audioURL}
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
        </>
    );
};

export default MicRecorder;