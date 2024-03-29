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
import {useAuthState} from "../auth/context";


const backGroundColor = '#eeeeff'
const barsColor = '#1976d2'
const DELAY_TIMER = 3


const formatSizeBytes = (size) => {
    if (size < 1024) {
        return `${size} bytes`
    } else if (size < 2 ** 20) {
        return `${(size / 1024).toFixed(1)} KB`
    } else if (size < 2 ** 30) {
        return `${(size / 2 ** 20).toFixed(2)} MB`
    }
}

const VoiceRecorder = (props) => {
    const {setOpen} = props
    const {dispatch} = useAudioState()

    const [isRecording, setIsRecording] = useState(null);
    const [isPaused, setIsPaused] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [recordedFile, setRecordedFile] = useState(null)
    const [message, setMessage] = useState('')
    const [startTime, setStartTime] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isCounting, setIsCounting] = useState(false)
    const [reverseCounter, setReverseCounter] = useState(DELAY_TIMER)
    const [size, setSize] = useState(0)
    const [maxSize, setMaxSize] = useState(0)
    const [maxTime, setMaxTime] = useState(0)
    const [limitReached, setLimitReached] = useState(false)
    const [sessionID, setSessionID] = useState(null)
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyzerRef = useRef(null);
    let dataArray = new Uint8Array(256);

    const state = useAuthState()
    const user = state.user
    const tierDetails = user.tier_details

    const initSessionId = async () => {
        let url = STREAM_UPLOAD_URL + `/start`
        if (sessionID !== null) {
            url += '?session_id=' + sessionID
        }
        const response = await fetcher({url, credentials: true})
        setSessionID(response.session_id)
    }

    useEffect(() => {
        let audioContext = new AudioContext();
        let analyzer = audioContext.createAnalyser();
        let gainNode = audioContext.createGain();
        gainNode.connect(analyzer);
        analyzer.fftSize = 512;
        analyzerRef.current = analyzer;
        audioContextRef.current = audioContext
        setMaxTime(tierDetails.mic_length)
        setMaxSize(tierDetails.file_size * 2 ** 20)     // convert  DB limit (Mb) to bytes
        initSessionId()
        return () => {
            audioContext.close()
            if (!!mediaRecorderRef.current) {
                mediaRecorderRef.current.stop()
            }
            mediaRecorderRef.current = null
        }
    }, []);

    useEffect(() => {
        let interval;
        let newElapsedTime;
        interval = setInterval(() => {
            if (isRecording && !isPaused) {
                newElapsedTime = (Date.now() - startTime) / 1000 + elapsedTime
                setElapsedTime(newElapsedTime)
            } else {
                clearInterval(interval)
            }
            if (newElapsedTime > maxTime - 10) {
                setMessage('You are running out of time, record will be stopped soon')
                if (newElapsedTime > maxTime) {
                    handlePauseRecording()
                    setLimitReached(true)
                    setMessage('You have reached the limit, record was paused')
                }
            }
        }, 100)

        return () => {
            clearInterval(interval);
        };
    }, [isRecording, isPaused]);

    useEffect(() => {
        let counter = reverseCounter
        let counterInterval = setInterval(() => {
            if (isCounting) {
                counter--
                setReverseCounter(prev => prev - 1)
            }
            if (counter <= 0) {
                clearInterval(counterInterval)
                setReverseCounter(DELAY_TIMER)
                handleStartRecording()
            }
        }, 1000)
        return () => {
            clearInterval(counterInterval);
        }
    }, [isCounting]);

    const handleCountDown = () => {
        setIsCounting(prev => !prev)
    }
    const handleStartRecording = async () => {
        setStartTime(Date.now() - elapsedTime * 1000)
        setIsCounting(false)
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                const source = audioContextRef.current.createMediaStreamSource(stream)
                source.connect(analyzerRef.current)

                const recorder = new MediaRecorder(stream);
                recorder.ondataavailable = (event) => {
                    uploadData(event.data);
                };

                recorder.onstop = () => {
                    stream.getTracks().forEach(track => track.stop());
                };
                recorder.start(1000);
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
            })
            .catch(error => console.error('Error accessing microphone:', error));
    }

    const uploadData = async (data) => {
        let chunkNum = Math.ceil((Date.now() - startTime + elapsedTime) / 1000);
        const body = new FormData()
        body.append('file', data)
        const url = STREAM_UPLOAD_URL + `/chunk/${sessionID}/${chunkNum}`
        const response = await fetcher({url, body, credentials: true})
        setSize(response.size)
        if (response.size > maxSize * 0.9) {
            setMessage('You are running out of space, record will be stopped soon')
            if (response.size > maxSize) {
                handlePauseRecording()
                setLimitReached(true)
                setMessage('You have reached the limit, record was paused')
            }
        }
    }

    const completeUpload = async () => {
        const url = STREAM_UPLOAD_URL + `/complete/${sessionID}`
        const response = await fetcher({url, credentials: true})
        const readyUrl = BASE_URL + `/audio/get_audio?file_id=${response.file_id}`
        setAudioURL(readyUrl)
        setIsCompleted(true)
        setRecordedFile({...response.file, duration: elapsedTime})
        setMessage('Your record was saved!')
    }

    const handlePauseRecording = () => {
        setAudioURL(null)
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        setAudioURL(STREAM_UPLOAD_URL + `/${sessionID}`)
    }
    const handleResumeRecording = () => {
        setStartTime(prev => Date.now())
        mediaRecorderRef.current.resume()
        setIsPaused(false)
    }
    const handleStopRecording = () => {
        mediaRecorderRef.current.stop()
        setIsRecording(null)
        setIsPaused(null)
        completeUpload();
    }

    const handleRecordAgain = () => {
        setIsRecording(false);
        setElapsedTime(0)
        setIsPaused(false);
        setAudioURL('');
        setIsCompleted(false)
        setReverseCounter(DELAY_TIMER)
        initSessionId()
        setSize(0)
        if (!!mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
        }
    }

    const completeAndClose = () => {
        setOpen(false)
        dispatch({type: AudioAction.ADD_FILE, file: recordedFile})
        setMessage('Record successfully uploaded')
    }

    const visualize = async (canvasContext) => {
        const analyzer = analyzerRef.current
        const canvas = canvasContext.canvas
        if (!!canvas && !!analyzer) {
            analyzer.getByteFrequencyData(dataArray)
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            canvasContext.fillStyle = backGroundColor;
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
            if (!isPaused) {
                canvasContext.fillStyle = barsColor;
            } else {
                canvasContext.fillStyle = '#a9aaaa';
            }
            let barWidth = (canvas.width / dataArray.length) * 2.5;
            let barHeight;
            let x = 0;
            for (let i = 0; i < dataArray.length; i++) {
                barHeight = dataArray[i] * 0.8;
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
                    <span>Microphone recorder</span>
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
                            <Button onClick={handleCountDown}
                                    title="Start recording"
                                    variant='outlined'
                                    startIcon={<FiberManualRecordIcon color='error'/>}>
                                RECORD {isCounting && <> starts in : {reverseCounter} s</>}
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
                                <Button disabled={!isPaused && !limitReached}
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
                        Time : {elapsedTime.toFixed(1)} seconds of {maxTime} seconds
                    </div>
                    <div>
                        Uploaded: {formatSizeBytes(size) || 0} of {formatSizeBytes(maxSize)}
                    </div>

                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleRecordAgain}
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