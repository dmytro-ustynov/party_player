import {Box, Card, CardContent, IconButton, LinearProgress, Slider, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import {StopCircleOutlined} from "@mui/icons-material";
import {BASE_URL} from "../utils/constants";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";
import {useNavigate} from 'react-router-dom';

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
        return `${minutes}min ${seconds}s`;
    } else {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor((duration % 3600) % 60);
        return `${hours}h ${minutes}min ${seconds}s`;
    }
}

export default function FileCard(props) {
    const {file} = props
    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);
    const [player, setPlayer] = useState(null)
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(100)
    const {dispatch} = useAudioState()
    const navigate = useNavigate()

    useEffect(() => {
        setPlayer(audioRef.current)
        return () => {
            setPlayer(null)
        }
    }, [])

    useEffect(() => {
        const updateCurrentTime = () => {
            const time = player.currentTime > 300 ? player.currentTime.toFixed(0) : player.currentTime.toFixed(1)
            if (!player.paused) {
                setCurrentTime(time);
            }
            setProgress(Math.round(100 * time / file.duration, 1))
        };
        if (player) {
            player.addEventListener("play", handlePlay);
            player.addEventListener("pause", handlePause);
            player.addEventListener("timeupdate", updateCurrentTime);
        }

        return () => {
            if (player) {
                player.removeEventListener("play", handlePlay);
                player.removeEventListener("pause", handlePause);
                player.removeEventListener('timeupdate', updateCurrentTime);
            }
        };
    }, [player, file]);
    const handleStopClick = () => {
        if (player) {
            player.pause()
            player.currentTime = 0
            setCurrentTime(0)
        }
    }

    const handlePlay = () => {
        // Handle the play event
        setPlaying(true)
    };

    const handlePause = () => {
        // Handle the pause event
        setPlaying(false)
    };

    const handleVolumeChange = (event) => {
        setVolume(event.target.value)
        player.volume = parseFloat(event.target.value / 100)
    };
    const handleDoubleClick = () =>{
        dispatch({type: AudioAction.SET_SOUND, soundId: file.file_id})
        // window.location.replace('/redactor')
        navigate('/redactor')
    }
    const controlsProps = {height: 28, width: 28}
    return (
        <div key={file.file_id}>
            <Card className="file-card">
                <audio src={BASE_URL + "/audio/get_audio?file_id=" + file.file_id} preload="none"
                       ref={audioRef}
                />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent className="file-card-title">
                        <Typography component="div" variant="p"
                                    onDoubleClick={handleDoubleClick}
                                    sx={{cursor: 'pointer'}}
                                    title="Double click to open in redactor">
                            {file.filename}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary"
                                    component="div"
                                    sx={{marginTop: "auto"}}>
                            {formatDuration(file.duration)}
                        </Typography>
                    </CardContent>
                    <Box>
                        <LinearProgress variant="determinate" value={progress}/>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', pl: 1, pb: 1}}>
                        <IconButton onClick={handleStopClick} color='primary' sx={{p: 0.5}}>
                            <StopCircleOutlined sx={controlsProps}/>
                        </IconButton>
                        {playing ? (
                            <IconButton onClick={() => player.pause()} color='primary'>
                                <PauseCircleOutlineIcon sx={controlsProps}/>
                            </IconButton>
                        ) : (
                            <IconButton onClick={() => player.play()} color='primary'>
                                <PlayArrowIcon sx={controlsProps}/>
                            </IconButton>
                        )}
                        <Slider size="small"
                                aria-label="Volume"
                                value={volume}
                                onChange={handleVolumeChange}
                                sx={{width: '60px'}}/>
                        {currentTime !== 0 && <div style={{marginLeft: 'auto', paddingRight: '15px'}}>
                            <Typography variant="body2">{currentTime}</Typography>
                        </div>}
                    </Box>
                </div>
            </Card>
        </div>
    )
}