import {Button, Stack} from "@mui/material";
import React, {useState} from "react";
import {useAudioState} from "./audioReducer";
import Snackbar from '@mui/material/Snackbar';


export default function OperationButtons() {
    const [message, setMessage] = useState('')

    const {audio} = useAudioState()

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

    return (
        <Stack direction="row" spacing={0.5} ml={3} mt={1} mb={1}>
            <Button variant='outlined' disabled={loading}>Fade in</Button>
            <Button variant='outlined' disabled={loading}>Fade Out</Button>
            <Button variant='outlined' disabled={loading}>Delete </Button>
            <Button variant='outlined' disabled={loading}>Clear </Button>
            <Button variant='outlined' disabled={loading}>Cut </Button>
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