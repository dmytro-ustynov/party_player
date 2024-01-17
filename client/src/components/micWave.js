import React, {useEffect, useRef, useState} from 'react';
import {Button} from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import StopIcon from "@mui/icons-material/Stop";
import PauseIcon from "@mui/icons-material/Pause";
import EjectIcon from '@mui/icons-material/Eject';
import {BASE_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";

const AudioVisualizer = () => {
    const [audioURL, setAudioURL] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    // const [analyzer, setAnalyzer] = useState(null);
    const [uploadedSize, setUploadedSize] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [sessionID, setSessionId] = useState(null)

    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const analyzerRef = useRef(null);

    const getSessionId = async () => {
        const url = BASE_URL + `/audio/record/start`
        const response = await fetcher({url, credentials: true,})
        setSessionId(response?.session_id)
    }
    useEffect(() => {
        let gainNode;
        let dataArray;
        let analyzer;
        let audioContext;

        const initAudio = async () => {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyzer = audioContext.createAnalyser();
            gainNode = audioContext.createGain();
            const destination = audioContext.createMediaStreamDestination();
            // console.log(analyser)
            gainNode.connect(analyzer);
            analyzer.connect(destination);
            const source = audioContext.createMediaElementSource(audioRef.current);
            source.connect(gainNode);

            const recorderSource = audioContext.createMediaStreamSource(destination.stream);
            recorderSource.connect(audioContext.destination);

            analyzer.fftSize = 256;
            dataArray = new Uint8Array(analyzer.frequencyBinCount);
            analyzerRef.current = analyzer
            audioContextRef.current = audioContext
            getSessionId()
            visualize();
        };

        const visualize = () => {
            const canvas = canvasRef.current;
            const analyzer = analyzerRef.current;
            const recorder = mediaRecorderRef.current
            analyzer.getByteFrequencyData(dataArray);
            if (canvas !== null) {
                console.log(dataArray)
                const canvasContext = canvas.getContext('2d');

                canvasContext.clearRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / dataArray.length) * 2.5;
                let barHeight;
                let x = 0;

                canvasContext.fillStyle = 'rgb(0, 255, 0)';

                for (let i = 0; i < dataArray.length; i++) {
                    barHeight = dataArray[i];
                    canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
                    x += barWidth + 1;
                }
            }
            if (recorder && recorder.state === 'recording') {
                requestAnimationFrame(visualize);
            }
        };

        const startVisualization = () => {
            if (!audioContextRef.current) {
                initAudio();
            }
        };

        startVisualization();
        return () => {
            gainNode = null
            analyzer = null
            audioContext = null
            dataArray = null
        };
    }, []); // Empty dependency array to run only once

    const uploadData = async (data) => {
        let chunkNum = Math.ceil((Date.now() - startTime + elapsedTime) / 1000);
        const body = new FormData()
        body.append('file', data)
        const url = BASE_URL + `/audio/record/chunk/${sessionID}/${chunkNum}`
        const response = await fetcher({url, body, credentials: true,})
        setUploadedSize(response.size)
    }
    const handleStartRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    console.log('uploading...')
                    uploadData(event.data);
                }
            }
        )
        mediaRecorderRef.current.addEventListener('stop', () => {
            console.log('stoping recorder')
            stream.getTracks().forEach(track => track.stop());
            // completeUpload();
        })
        mediaRecorderRef.current.addEventListener('pause', ()=>{
            const url = BASE_URL + `/audio/record/${sessionID}`
            setAudioURL(url)
        })

        setStartTime(Date.now())
        mediaRecorderRef.current.start(1000);
        setIsRecording(true);
    }
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

    return <>
        <canvas ref={canvasRef} width={'auto'} height={100}/>
        <audio ref={audioRef} src={audioURL} controls/>
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
            size: {uploadedSize} bytes.
            Recorded time: {elapsedTime} seconds.
        </div>

    </>
};

export default AudioVisualizer;
