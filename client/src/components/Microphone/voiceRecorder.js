import {Button, Chip, DialogActions, DialogContent, DialogTitle, Stack} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PauseIcon from "@mui/icons-material/Pause";
import EjectIcon from "@mui/icons-material/Eject";
import StopIcon from "@mui/icons-material/Stop";
import ReplayIcon from "@mui/icons-material/Replay";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import React, {useEffect, useRef, useState} from "react";
import {fetcher} from "../../utils/fetch_utils";
import Canvas from "./Canvas";
import {BASE_URL, STREAM_UPLOAD_URL} from "../../utils/constants";
import {AudioAction} from "../audio/actions";
import {useAudioState} from "../audio/audioReducer";
import Snackbar from "@mui/material/Snackbar";


const backGroundColor = '#eeeeff'
const barsColor = '#1976d2'

const VoiceRecorder = (props) => {
    const {setOpen} = props
    const {dispatch} = useAudioState()

    const [isRecording, setIsRecording] = useState(null);
    const [isPaused, setIsPaused] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [recordedFile, setRecordedFile] = useState(null)
    const [message, setMessage] = useState('')
    // const [audioBlob, setAudioBlob] = useState(null);
    const [currentTime, setCurrentTime] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [countTimer, setCountTimer] = useState(null)
    const [size, setSize] = useState(0)
    const [sessionID, setSessionID] = useState(null)
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyzerRef = useRef(null);
    let dataArray = new Uint8Array(256);

    const initSessionId = async () => {
        const url = STREAM_UPLOAD_URL + `/start`
        const response = await fetcher({url, credentials: true})
        setSessionID(response.session_id)
    }

    useEffect(() => {
        let audioContext = new AudioContext();
        let analyzer = audioContext.createAnalyser();
        let gainNode = audioContext.createGain();
        // destination = audioContext.createMediaStreamDestination();
        gainNode.connect(analyzer);
        // analyzer.connect(destination);
        analyzer.fftSize = 1024;
        analyzerRef.current = analyzer;
        audioContextRef.current = audioContext
        initSessionId()
        return () => {
            audioContext.close()
            if (!!mediaRecorderRef.current) {
                mediaRecorderRef.current.stop()
            }
            mediaRecorderRef.current = null
        }
    }, []);

    // useEffect(() => {
    //     if (countTimer === 0) {
    //         setCountTimer(null)
    //         setIsRecording(true)
    //         setStartTime(Date.now())
    //     }
    //     if (!countTimer) return
    //     const timer = setInterval(() => {
    //         setCountTimer(prev => prev - 1)
    //     }, 1000)
    //     return () => clearInterval(timer)
    // }, [countTimer]);
    const handleStartRecording = async () => {
        // setCountTimer(3)
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                const source = audioContextRef.current.createMediaStreamSource(stream)
                source.connect(analyzerRef.current)

                const recorder = new MediaRecorder(stream);
                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        uploadData(event.data);
                    }
                };

                recorder.onstop = () => {
                    stream.getTracks().forEach(track => track.stop());
                };
                setStartTime(Date.now())
                recorder.start(1000);
                mediaRecorderRef.current = recorder;
            })
            .catch(error => console.error('Error accessing microphone:', error));
        setIsRecording(true);
    }

    const uploadData = async (data) => {
        let chunkNum = Math.ceil((Date.now() - startTime + elapsedTime) / 1000);
        const body = new FormData()
        body.append('file', data)
        const url = STREAM_UPLOAD_URL + `/chunk/${sessionID}/${chunkNum}`
        const response = await fetcher({url, body, credentials: true})
        setSize(response.size)
        const delta = (startTime - Date.now()) / 1000
        console.log(startTime, Date.now(), delta)
        setElapsedTime(delta)
    }

    const completeUpload = async () => {
        const url = STREAM_UPLOAD_URL + `/complete/${sessionID}`
        const response = await fetcher({url, credentials: true})
        const readyUrl = BASE_URL + `/audio/get_audio?file_id=${response.file_id}`
        setAudioURL(readyUrl)
        setIsCompleted(true)
        setRecordedFile({...response.file, duration: -1})
        setMessage('Your record was saved!')
    }

    const handlePauseRecording = () => {
        setAudioURL(null)
        const recorder = mediaRecorderRef.current
        recorder.pause()
        // setIsRecording(false)
        setIsPaused(true)
        setAudioURL(STREAM_UPLOAD_URL + `/${sessionID}`)
    }
    const handleResumeRecording = () => {
        const recorder = mediaRecorderRef.current
        recorder.resume()
        // setIsRecording(true)
        setIsPaused(false)
    }
    const handleStopRecording = () => {
        const recorder = mediaRecorderRef.current
        recorder.stop()
        setIsRecording(false)
        setIsPaused(null)
        completeUpload();
    }

    const handleRecordAgain = () => {
        setIsRecording(false);
        setIsPaused(false);
        setAudioURL('');
        // setAudioBlob(null);
        setIsCompleted(false)
        initSessionId()
        setSize(0)
    }

    const completeAndClose = () => {

        setOpen(false)
        dispatch({type: AudioAction.ADD_FILE, file: recordedFile})
        setMessage('Record successfully uploaded')
        // TODO: recordedFile does not have duration seconds here
        console.log(recordedFile)
    }

    const visualize = async (canvasContext) => {
        const analyzer = analyzerRef.current
        const canvas = canvasContext.canvas
        if (!!canvas && !!analyzer) {
            if (!!isRecording) {
                analyzer.getByteFrequencyData(dataArray)
            } else {
                dataArray = new Uint8Array(256)
            }
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            canvasContext.fillStyle = backGroundColor;
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
            canvasContext.fillStyle = barsColor;
            let barWidth = (canvas.width / dataArray.length) * 2.5;
            let barHeight;
            let x = 0;
            for (let i = 0; i < dataArray.length; i++) {
                barHeight = isPaused ? 2 : dataArray[i];
                let centerY = canvas.height / 2;
                let barTop = centerY - barHeight / 2;
                let barBottom = centerY + barHeight / 2;
                canvasContext.fillRect(x, barTop, barWidth, barBottom - barTop);
                x += barWidth + 1;
            }
        }
        requestAnimationFrame(visualize);
    }

    return (
        <div>
            <DialogTitle>
                <Stack direction="row" spacing={8}>
                    <span>RECORD</span>

                </Stack>
            </DialogTitle>

            <DialogContent>
                <div style={{justifyContent: "flex-end", display: "flex"}}>
                    <Chip label={<span className="on-air-label"><MicIcon size="small"/><>ON AIR</></span>}
                          color={isRecording && !isPaused ? "error" : "default"}/>
                </div>
                <div>
                    <div style={{marginBottom: "1rem"}}>
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
                    </div>
                    <audio ref={audioRef} src={audioURL} controls/>
                    <Canvas draw={visualize}/>
                    <div>
                        Time : {elapsedTime} seconds
                    </div>
                    <div>
                        Uploaded: {size} bytes
                    </div>

                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleRecordAgain}
                        // disabled={isCompleted}
                        startIcon={<ReplayIcon/>}
                        variant='contained'>
                    Record Again
                </Button>
                {isCompleted ? (
                    <Button
                        onClick={completeAndClose}
                        color='success'
                        variant="contained"
                        startIcon={<FileUploadIcon/>}>
                        Done
                    </Button>
                ) : (
                    <Button variant='contained'
                            onClick={() => setOpen(false)}>
                        Close
                    </Button>)}
            </DialogActions>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
        </div>
    )
}

export default VoiceRecorder