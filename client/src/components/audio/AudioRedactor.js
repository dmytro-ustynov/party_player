import {Button, Grid, LinearProgress, Stack} from "@mui/material";
import React, {useEffect, useRef} from "react";
import {useAudioState} from "./audioReducer";
import {BASE_URL} from "../../utils/constants";
import {AudioAction} from "./actions";
import Box from "@mui/material/Box";
import createWavesurfer from "./utils";
import PlayerButtons from "./PlayerButtons";


export default function AudioRedactor() {
    const {audio, dispatch} = useAudioState()
    const sound = audio.sound
    const loading = audio.loading

    const wavesurfer = useRef(null)

    useEffect(() => {
        wavesurfer.current = createWavesurfer()
        wavesurfer.current.enableDragSelection({});
        dispatch({type: AudioAction.SET_WAVESURFER, wavesurfer})
        return () => {
            wavesurfer.current.destroy()
        }
    }, [dispatch])

    useEffect(() => {
        if (sound) {
            wavesurfer.current.on('ready', function () {
                dispatch({type: AudioAction.SET_LOADING, loading: false})
            })
            dispatch({type: AudioAction.SET_LOADING, loading: true})
            const url = BASE_URL + "/audio/get_audio?file_id=" + sound
            wavesurfer.current.load(url)
        }
    }, [sound, dispatch])

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
                <div id='audioplayer_tl'></div>
            </div>
            <PlayerButtons/>
        </Grid>
    )
}