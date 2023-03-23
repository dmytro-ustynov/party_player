import {Button, Grid, IconButton, Slider, Stack} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import WaveSurfer from "wavesurfer.js";
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions";
import MarkersPlugin from "wavesurfer.js/dist/plugin/wavesurfer.markers";
import {useAudioState} from "./audio/audioReducer";
import {BASE_URL} from "../utils/constants";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EjectIcon from "@mui/icons-material/Eject";
import StopIcon from "@mui/icons-material/Stop";
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import VolumeMuteRoundedIcon from "@mui/icons-material/VolumeMuteRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';


export default function AudioRedactor() {
    const {audio} = useAudioState()
    const [volumeLevel, setVolumeLevel] = useState(50)
    const [previousVolume, setPreviousVolume] = useState(50)

    const wavesurfer = useRef(null)

    const fileId = audio.sound

    useEffect(() => {
        wavesurfer.current = WaveSurfer.create({
            container: `#audioplayer`,
            waveColor: "#29d9ce",
            progressColor: "#efda9d",
            height: 150,
            maxPxPerSec: 1000,
            cursorWidth: 1,
            cursorColor: "lightgray",
            normalize: true,
            responsive: true,
            fillParent: true,
            splitChannels: true,
            plugins: [
                CursorPlugin.create({
                    container: '#audioplayer',
                    showTime: true,
                    opacity: 0.9,
                }),
                TimelinePlugin.create({
                    container: '#audioplayer_tl'
                }),
                RegionsPlugin.create(),
                MarkersPlugin.create(),
            ]

        });
        wavesurfer.current.enableDragSelection({});
        return () => {
            wavesurfer.current.destroy()
        }
    }, [])
    useEffect(() => {
        if (fileId) {
            console.log('loading: ', fileId)
            const url = BASE_URL + "/audio/get_audio?file_id=" + fileId
            wavesurfer.current.load(url)
        }
    }, [fileId])


    const scrollEvent = () => {

    }
    const clearMarkers = () => {
        wavesurfer.current.markers.clear()
    }
    let showClearMarkersBtn;
    if (wavesurfer.current?.markers?.markers?.length) {
        showClearMarkersBtn = (
            <>
                <button className='clearmarkers_btn'
                        onClick={clearMarkers}>x
                </button>
            </>
        )
    }

    const createMarker = (e) => {
        console.log('create new Marker')
        const wave = wavesurfer.current
        console.log(wave)
        const number = wave.markers.markers.length + 1
        const bbox = wave.container.getBoundingClientRect();
        var xpos = e.clientX - bbox.left

        const duration = wave.getDuration();
        const elementWidth =
            wave.drawer.width /
            wave.params.pixelRatio;
        const scrollWidth = wave.drawer.getScrollX();
        const scrollTime =
            (duration / wave.drawer.width) * scrollWidth;

        const timeValue =
            Math.max(0, (xpos / elementWidth) * duration) + scrollTime;

        const newMarker = wave.markers.add({
            time: timeValue,
            label: `m${number}`,
            color: '#ff990a',
            position: 'top',
        })
        newMarker.el.setAttribute('marker--time', timeValue)
        // newMarker.el.addEventListener('contextmenu', markerRightClick,)
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
        <Grid container>
            <Stack direction="row" spacing={2} ml={3} mt={1}>
                <Button variant='outlined'>title 1</Button>
                <Button variant='outlined'>some title</Button>
            </Stack>
            <div style={{width: '100%'}}>
                <div id='audioplayer'
                     className='playerLayerCurrentPosition'>
                    <div className='markers-placeholder'
                         id="markers-placeholder"
                         title='Double click to add marker'
                         onDoubleClick={createMarker}>
                        {showClearMarkersBtn}
                    </div>
                </div>
                <div id='audioplayer_tl'
                     onWheel={scrollEvent}>
                </div>
            </div>
            <Stack direction="row" spacing={0} ml={3} mt={2}>
                <Button variant="outlined">
                    <EjectIcon sx={{transform: "rotate(90deg)"}}/></Button>
                <Button variant="outlined" onClick={() => {
                    wavesurfer.current.play()
                }}>
                    <PlayArrowIcon color='success'/></Button>
                <Button variant="outlined" onClick={() => {
                    wavesurfer.current.pause()
                }}>
                    <PauseIcon color='primary'/>
                </Button>
                <Button variant="outlined" onClick={() => {
                    wavesurfer.current.stop()
                }}>
                    <StopIcon color="error"/>
                </Button>
                <Button variant="outlined">
                    <QueueMusicIcon/>
                </Button>
                <Stack spacing={1} direction="row" sx={{width: 200}} alignItems="center">
                    <IconButton title="Mute" color='primary' onClick={toggleVolume}>
                        {volumeLevel === 0 ? < VolumeOffRoundedIcon/> : <VolumeMuteRoundedIcon/>}
                    </IconButton>
                    <Slider aria-label="Volume" value={volumeLevel} onChange={setPlayerVolume}/>
                    <VolumeUpRoundedIcon/>
                </Stack>
            </Stack>
        </Grid>)
}