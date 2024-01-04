import {Button, Divider, Grid, Typography} from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Box from "@mui/material/Box";
import {useAudioState} from "./audio/audioReducer";
import React, {useEffect, useState} from "react";
import {BASE_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {AudioAction} from "./audio/actions";
import Snackbar from "@mui/material/Snackbar";

export default function FileInfo() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imgSrc, setImgSrc] = useState('');
    const [error, setError] = useState(null);
    const [allowed, setAllowed] = useState(false);
    const [message, setMessage] = useState('')

    const {audio, dispatch} = useAudioState()
    const info = audio.info
    const sound = audio.sound

    useEffect(() => {
        setImgSrc(info.thumbnail)
    }, [info.thumbnail])

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG, and GIF files are allowed.');
            return;
        }

        // Check file size
        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            setError('The file size should not exceed 5 MB.');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setAllowed(true);
        console.log(file)
    };

    const handleUpload = async () => {
        const url = BASE_URL + '/image/thumbnail?file_id=' + sound
        const body = new FormData()
        body.append('file', selectedFile)
        const response = await fetcher({url, credentials: true, body})
        if (response.result === true) {
            dispatch({type: AudioAction.UPDATE_FILE_INFO, info: {...info, thumbnail: response.path}})
            const salt = Date.now()
            setImgSrc(`${response.path}?${salt}`)
            setMessage('Thumbnail changed successfully')
        } else {
            setMessage(response.details)
        }
        console.log(response)
        setSelectedFile(null)
        setAllowed(false)
    }


    return (
        <Grid container>
            <Grid item>
                <Box className={"table-item-info"} size="small">
                    <Typography variant="h5">File Details</Typography>
                    <Divider/>
                    <Typography variant="h6">{info.title}</Typography>
                    <Typography variant="body1" title="Track author">{info.author}</Typography>
                    <Typography variant="body1">ext: {info.ext}</Typography>
                    <Typography variant="body1">Duration: {info.duration} sec</Typography>
                    <Typography variant="body1">Size: {info.size} Mb</Typography>
                    {info.thumbnail ? <Button component="label" title="Click to change thumbnail">
                            <input hidden accept="image/*" type="file"
                                   onChange={handleFileInputChange}/>
                            <img src={imgSrc} key={imgSrc} alt='thumb' style={{maxWidth: "320px"}}/>
                        </Button> :
                        <Button variant="outlined" component="label" title="Click to change thumbnail">
                            thumbnail
                            <input hidden accept="image/*" type="file"
                                   onChange={handleFileInputChange}/>
                        </Button>}

                    <Typography variant="body2">File ID: {info.file_id}</Typography> {allowed && <>
                    <Button onClick={handleUpload}>
                        <FileUploadIcon color={error ? "default" : "success"}/>
                    </Button>
                    <Typography variant='body2'> Upload {selectedFile?.name}</Typography>
                </>}

                </Box>
            </Grid>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
        </Grid>
    )
}