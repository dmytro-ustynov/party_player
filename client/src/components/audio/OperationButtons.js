import {Button, Stack} from "@mui/material";
import React, {useState} from "react";
import {useAudioState} from "./audioReducer";
import Snackbar from '@mui/material/Snackbar';
import {AudioOperation, BASE_URL, OPERATION_URL} from "../../utils/constants";
import {fetcher} from "../../utils/fetch_utils";
import {AudioAction} from "./actions";


export default function OperationButtons() {
    const [message, setMessage] = useState('')

    const {audio, dispatch} = useAudioState()

    const sound = audio.sound
    const loading = audio.loading
    const selection = audio.selection
    const wavesurfer = audio.wavesurfer
    const clearMarkers = () => {
        wavesurfer.current.markers.clear()
    }
    const handlePaste = () => {
        if (!selection) {
            setMessage('You must select fragment before')
        }
    }
    function createOperationPayload(action){
        const payload = {action, file_id: sound}
        let regions = wavesurfer.current.regions
        if (Object.entries(regions.list).length > 0) {
            for (const region of Object.entries(regions.list)) {
                payload.details = {
                    start: region[1].start,
                    end: region[1].end
                }
                break
            }
        }
        console.log(payload)
        return payload
    }
    const handleFadeIn = async ()=>{
        if (!selection) {
            setMessage('You must select fragment to Fade')
            return
        }
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = OPERATION_URL
        const payload = createOperationPayload(AudioOperation.FADE_IN)
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setMessage('Fade In complete')
            wavesurfer.current.clearRegions()
            dispatch({type: AudioAction.ADD_SELECTION, selection: false})
            wavesurfer.current.load(BASE_URL + "/audio/get_audio?file_id=" + sound)
        } else {
            console.log(response)
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }
    const handleFadeOut = async ()=>{
        if (!selection) {
            setMessage('You must select fragment to Fade')
            return
        }
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = OPERATION_URL
        const payload = createOperationPayload(AudioOperation.FADE_OUT)
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setMessage('Fade Out complete')
            wavesurfer.current.clearRegions()
            dispatch({type: AudioAction.ADD_SELECTION, selection: false})
            wavesurfer.current.load(BASE_URL + "/audio/get_audio?file_id=" + sound)
        } else {
            console.log(response)
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }
    const handleDelete = async () => {
        if (!selection) {
            setMessage('You must select fragment to delete')
            return
        }
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = OPERATION_URL
        const payload = createOperationPayload(AudioOperation.DELETE_FRAGMENT)
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setMessage('delete complete')
            wavesurfer.current.clearRegions()
            dispatch({type: AudioAction.ADD_SELECTION, selection: false})
            dispatch({type: AudioAction.UPDATE_FILE_INFO, info: {...audio.info, duration: response.duration}})
            wavesurfer.current.load(BASE_URL + "/audio/get_audio?file_id=" + sound)
        } else {
            console.log(response)
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }
    const handleClear = async () => {
        if (!selection) {
            setMessage('You must select fragment to clear')
            return
        }
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = OPERATION_URL
        const payload = createOperationPayload(AudioOperation.CLEAR)
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setMessage('clear complete')
            wavesurfer.current.clearRegions()
            dispatch({type: AudioAction.ADD_SELECTION, selection: false})
            wavesurfer.current.load(BASE_URL + "/audio/get_audio?file_id=" + sound)
        } else {
            console.log(response)
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }
    const handleCut = async () => {
        if (!selection) {
            setMessage('You must select fragment to cut')
            return
        }
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = OPERATION_URL
        const payload = createOperationPayload(AudioOperation.TRIM)
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setMessage('Cut complete')
            wavesurfer.current.clearRegions()
            dispatch({type: AudioAction.ADD_SELECTION, selection: false})
            dispatch({type: AudioAction.UPDATE_FILE_INFO, info: {...audio.info,
                    duration: response.duration, filename: response.filename}})
            wavesurfer.current.load(BASE_URL + "/audio/get_audio?file_id=" + sound)
        } else {
            console.log(response)
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }

    return (
        <Stack direction="row" spacing={0.5} ml={3} mt={1} mb={1}>
            <Button variant='outlined' disabled={loading} onClick={handleFadeIn}>Fade in</Button>
            <Button variant='outlined' disabled={loading} onClick={handleFadeOut}>Fade Out</Button>
            <Button variant='outlined' disabled={loading} onClick={handleDelete}>Delete </Button>
            <Button variant='outlined' disabled={loading} onClick={handleClear}>Clear </Button>
            <Button variant='outlined' disabled={loading} onClick={handleCut}>Cut </Button>
            <Button variant='outlined' disabled={loading} onClick={handlePaste}>Paste</Button>
            <Button variant='outlined' disabled={loading} onClick={clearMarkers}>Drop Markers</Button>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                color='success'
                autoHideDuration={3000}
                onClose={() => setMessage(null)}
                message={message}/>
        </Stack>
    )
}