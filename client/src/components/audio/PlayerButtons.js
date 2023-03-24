import {Button, ButtonGroup, IconButton, Slider, Stack} from "@mui/material";
import EjectIcon from "@mui/icons-material/Eject";
import ClearIcon from "@mui/icons-material/Clear";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import VolumeMuteRoundedIcon from "@mui/icons-material/VolumeMuteRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import React, {useState} from "react";
import {useAudioState} from "./audioReducer";
import {AudioAction} from "./actions";

export default function PlayerButtons() {
    const [volumeLevel, setVolumeLevel] = useState(50)
    const [previousVolume, setPreviousVolume] = useState(50)

    const {audio, dispatch} = useAudioState()

    const loading = audio.loading
    const wavesurfer = audio.wavesurfer
    const selection = audio.selection

    const playSelected = () => {
        let regions = wavesurfer.current.regions
        if (Object.entries(regions.list).length > 0) {
            for (const [regionId, region] of Object.entries(regions.list)) {
                // console.log(`${regionId} - ${region.start} : ${region.end}`)
                region.play()
            }
        }
    }
    const clearRegions = () => {
        wavesurfer.current.clearRegions()
        dispatch({type: AudioAction.ADD_SELECTION, selection: false})
    }
    const zoomWavePlus = () => {
        wavesurfer.current.zoom(wavesurfer.current.params.minPxPerSec + 10)
    }
    const zoomWaveMinus = () => {
        wavesurfer.current.zoom(wavesurfer.current.params.minPxPerSec - 10)
    }

    const dropZoom = () => {
        wavesurfer.current.zoom(0)
    }

    const setPlayerVolume = (event) => {
        const volume = event.target.value;
        wavesurfer.current.setVolume(volume / 100)
        setVolumeLevel(volume)
    }
    const toggleVolume = () => {
        if (volumeLevel > 0) {
            setPreviousVolume(volumeLevel)
            wavesurfer.current.setVolume(0)
            setVolumeLevel(0)
        } else {
            wavesurfer.current.setVolume(previousVolume / 100)
            setVolumeLevel(previousVolume)
        }
    }

    return (
        <Stack direction="row" spacing={0} ml={3} mt={2}>
            <ButtonGroup color="primary" disabled={loading || !selection}>
                <Button variant="outlined" onClick={playSelected} title="PLay selected fragment">
                    <EjectIcon sx={{transform: "rotate(90deg)"}}/></Button>
                <Button variant="outlined" title='Drop selection' onClick={clearRegions}>
                    <ClearIcon/>
                </Button>
            </ButtonGroup>
            <Button variant="outlined" disabled={loading} onClick={() => {
                wavesurfer.current.play()
            }}>
                <PlayArrowIcon color='success'/></Button>
            <Button variant="outlined" disabled={loading} onClick={() => {
                wavesurfer.current.pause()
            }}>
                <PauseIcon color='primary'/>
            </Button>
            <Button variant="outlined" disabled={loading} onClick={() => {
                wavesurfer.current.stop()
            }}>
                <StopIcon color="error"/>
            </Button>
            <Button variant="outlined">
                <QueueMusicIcon/>
            </Button>
            <Stack spacing={1} direction="row" sx={{width: 200}} alignItems="center">
                <IconButton title="Mute" color='primary' disabled={loading} onClick={toggleVolume}>
                    {volumeLevel === 0 ? < VolumeOffRoundedIcon/> : <VolumeMuteRoundedIcon/>}
                </IconButton>
                <Slider aria-label="Volume" disabled={loading} value={volumeLevel} onChange={setPlayerVolume}/>
                <VolumeUpRoundedIcon/>
            </Stack>
            <ButtonGroup disabled={loading} sx={{marginLeft: 1}}>
                <Button variant="outlined" onClick={dropZoom} title="Drop zoom to default">
                    <SearchOffIcon/>
                </Button>
                <Button variant="outlined" onClick={zoomWaveMinus} title="Zoom Less">
                    <ZoomOutRoundedIcon/>
                </Button>
                <Button variant="outlined" onClick={zoomWavePlus} title="Zoom More">
                    <ZoomInRoundedIcon/>
                </Button>
            </ButtonGroup>
        </Stack>
    )
}