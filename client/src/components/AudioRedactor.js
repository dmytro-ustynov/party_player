import {Button, ButtonGroup, Grid, IconButton, LinearProgress, Slider, Stack} from "@mui/material";
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
import ClearIcon from '@mui/icons-material/Clear';
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import {AudioAction} from "./audio/actions";
import Box from "@mui/material/Box";


export default function AudioRedactor() {
    const {audio, dispatch} = useAudioState()
    const [volumeLevel, setVolumeLevel] = useState(50)
    const [previousVolume, setPreviousVolume] = useState(50)

    const wavesurfer = useRef(null)

    const sound = audio.sound
    const loading = audio.loading

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
                    color: 'red',
                    showTime: true,
                    opacity: 0.9,
                }),
                TimelinePlugin.create({
                    container: '#audioplayer_tl'
                }),
                RegionsPlugin.create({maxRegions: 1}),
                MarkersPlugin.create(),
            ]

        });
        wavesurfer.current.enableDragSelection({});
        return () => {
            wavesurfer.current.destroy()
        }
    }, [])
    useEffect(() => {
        if (sound) {
            wavesurfer.current.on('ready', function () {
                dispatch({type: AudioAction.SET_LOADING, loading: false})
            })
            dispatch({type: AudioAction.SET_LOADING, loading: true})
            const url = BASE_URL + "/audio/get_audio?file_id=" + sound
            wavesurfer.current.load(url)
        }
    }, [sound])


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
    const playSelected = () => {
        let regions = wavesurfer.current.regions
        if (Object.entries(regions.list).length > 0) {
            for (const [regionId, region] of Object.entries(regions.list)) {
                console.log(`${regionId} - ${region.start} : ${region.end}`)
                region.play()
            }
        }
    }
    const clearRegions = () => {
        wavesurfer.current.clearRegions()
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

    const createMarker = (e) => {
        const wave = wavesurfer.current
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
            <Stack direction="row" spacing={2} ml={3} mt={1} mb={1}>
                <Button variant='outlined'>title 1</Button>
                <Button variant='outlined'>some title</Button>
            </Stack>
            <Box sx={{width: '100%', minHeight: '5px'}}>
                {loading && <LinearProgress/>}
            </Box>
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
                <ButtonGroup color="primary" disabled={loading}>
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
                <ButtonGroup disabled={loading}>
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
        </Grid>)
}