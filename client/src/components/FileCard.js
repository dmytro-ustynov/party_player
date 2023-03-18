import {Box, Card, CardContent, IconButton, LinearProgress, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import {StopCircleOutlined} from "@mui/icons-material";
import {BASE_URL} from "../utils/constants";

function formatDuration(duration) {
    if (duration < 60) {
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


    useEffect(() => {
        setPlayer(audioRef.current)
        return () => {
            setPlayer(null)
        }
    }, [])

    useEffect(() => {
        const updateCurrentTime = () => {
            const time = player.currentTime.toFixed(1)
            if (!player.paused) {
                setCurrentTime(time);
            }
            setProgress(Math.round(100 * time / file.duration, 1))
        };
        if (player) {
            player.addEventListener("play", handlePlay);
            player.addEventListener("pause", handlePause);
            player.addEventListener("volumechange", handleVolumeChange);
            player.addEventListener("timeupdate", updateCurrentTime);
        }

        return () => {
            if (player) {
                player.removeEventListener("play", handlePlay);
                player.removeEventListener("pause", handlePause);
                player.removeEventListener("volumechange", handleVolumeChange);
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

    const handleVolumeChange = () => {
        // Handle the volume change event
    };
    const controlsProps = {height: 28, width: 28}
    return (
        <div key={file.file_id}>
            <Card className="file-card">
                <audio src={BASE_URL + "/audio/get_audio?file_id=" + file.file_id}
                       ref={audioRef}
                />
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent className="file-card-title">
                        <Typography component="div" variant="p">
                            {file.filename}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" component="div">
                            {formatDuration(file.duration)}
                        </Typography>
                    </CardContent>
                    <Box sx={{width: '100%'}}>
                        <LinearProgress variant="determinate" value={progress}/>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', pl: 1, pb: 1}}>
                        <IconButton onClick={handleStopClick} color='primary'>
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
                        {currentTime !== 0 && <div style={{marginLeft: 'auto', paddingRight: '15px'}}>
                            <Typography variant="body2">{currentTime}</Typography>
                        </div>}
                    </Box>
                </Box>
            </Card>
        </div>
    )
}