import {Card, IconButton, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {StopCircleOutlined} from "@mui/icons-material";
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import {BASE_URL} from "../utils/constants";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";
import {useNavigate} from 'react-router-dom';
import WaveSurfer from "wavesurfer.js";


function formatDuration(duration) {
    duration = parseFloat(duration)
    if (duration < 5) {
        return duration.toFixed(2) + "s";
    } else if (duration < 10) {
        return duration.toFixed(1) + "s";
    } else if (duration < 60) {
        return duration.toFixed(0) + "s";
    } else if (duration < 3600) {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds}s`;
    } else {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor((duration % 3600) % 60);
        return `${hours}:${minutes}:${seconds}s`;
    }
}

function createWavesurfer(container_id) {

    return WaveSurfer.create({
        container: `#waveform-${container_id}`,
        waveColor: "#83A2E2",
        progressColor: "#134DBB",
        cursorColor: "white",
        height: 48,
        barWidth: 2,
        barGap: 1
    })
}

export default function FileBar(props) {
    const {file} = props
    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0);
    const {dispatch} = useAudioState()
    const navigate = useNavigate()
    const wavesurfer = useRef(null)

    useEffect(() => {
        wavesurfer.current = createWavesurfer(file.file_id)
        const url = BASE_URL + "/audio/get_audio?file_id=" + file.file_id
        wavesurfer.current.load(url)
        wavesurfer.current.on('audioprocess', () => {
            const time = wavesurfer.current.getCurrentTime().toFixed(2)
            setCurrentTime(time)
        })

        return () => {
            wavesurfer.current.destroy()
        }

    }, [file.file_path])

    const handlePlay = () => {
        // Handle the play event
        setPlaying(true)
        wavesurfer.current.play()
    };

    const handlePause = () => {
        // Handle the pause event
        setPlaying(false)
        wavesurfer.current.stop()
    };

    const openRedactor = () => {
        dispatch({type: AudioAction.SET_SOUND, soundId: file.file_id})
        navigate('/redactor?file_id=' + file.file_id)
    }
    const controlsProps = {height: 28, width: 28}
    return (
        <Card className="file-bar" key={file.file_id}>
            {playing ? (
                <IconButton onClick={handlePause} color='primary'>
                    <StopCircleOutlined sx={controlsProps}/>
                </IconButton>
            ) : (
                <IconButton onClick={handlePlay} color='primary'>
                    <PlayArrowIcon sx={controlsProps}/>
                </IconButton>
            )}
            <div className="file-bar-thumbnail"
                 onClick={openRedactor}
                 style={{backgroundImage: `url(${file.thumbnail_res})`}}/>

            <div className='file-bar-title-placeholder'>
                <Typography variant="body1" onClick={openRedactor}>{file.filename}</Typography>
                <Typography variant="caption">{file.author}</Typography>
            </div>
            <div id={`waveform-${file.file_id}`} className="file-bar-wave"/>
            <div className="file-bar-time">
                <AccessTimeFilledIcon fontSize="small" color="disabled"/>
                <Typography variant="caption">
                    {playing ? formatDuration(currentTime) : formatDuration(file.duration)}
                </Typography>
            </div>
        </Card>
    )
}