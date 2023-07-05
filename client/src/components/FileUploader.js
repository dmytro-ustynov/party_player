import {Grid, Paper} from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {useDropzone} from "react-dropzone";
import Typography from "@mui/material/Typography";
import React, {useCallback, useState} from "react";
import {UPLOAD_FILE_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {Roles, useAuthState} from "./auth/context";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";
import Snackbar from "@mui/material/Snackbar";


function getFileExtension(fileName) {
    return fileName.split('.').reverse()[0]
}

function validateAudioFile(file, user, fileCount) {
    const tier = user.tier_details
    const fileSize = file.size;
    const fileType = file.type;
    // Define the maximum file size (in bytes)
    const maxSize = tier.file_size * 1024 * 1024     // in bytes
    // Define the allowed file types
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/x-m4a", "audio/flac"];
    // check files count
    // const fileCount = audio.files.length
    console.log('now you have: ', fileCount)
    if (fileCount >= tier.max_files) {
        if (user.role === Roles.PREMIUM) {
            return `You can upload only ${fileCount} files.`
        } else {
            return `Your tier capacity is ${fileCount} files. Subscribe to higher plan.`
        }
    }
    // Check if the file type is allowed
    if (!allowedTypes.includes(fileType)) {
        return "File type not allowed. Please upload an audio file.";
    }
    const fileExtension = getFileExtension(file.name)
    if (!tier.formats.includes(fileExtension)) {
        return 'This file format is not allowed in your tier.'
    }

    if (fileSize > 100 * 1024 * 1024) {
        return "Maximum size to upload is 100Mb."
    } else if (fileSize > maxSize) {
        return `Current maximum file size for your tier: ${tier.file_size}Mb. Subscribe to higher tier to upload up to 100 Mb`
    }
    return null;
}


const defaultTitle = 'drag file here'
export default function FileUploader(props) {
    const [file, setFile] = useState([])
    const [title, setTitle] = useState(defaultTitle)
    const [forbidden, setForbidden] = useState(true)
    const [message, setMessage] = useState('')
    const {styles} = props
    const state = useAuthState()
    const {audio, dispatch} = useAudioState()
    const user = state.user

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0]
        const errMessage = validateAudioFile(file, user, audio.files.length)
        console.log(file)
        if (!errMessage) {
            setFile(file)
            setForbidden(false)
            setTitle(file.name)
            console.log('ready to upload')
        } else {
            // setTitle(errMessage)
            setMessage(errMessage)
        }
    }, [user, audio.files])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
    const handleUpload = async () => {
        const url = UPLOAD_FILE_URL
        const body = new FormData()
        body.append('audiofile', file)
        // body.append('user_id', user.user_id)
        const req = await fetcher({url, credentials: true, body})
        if (req.result === true) {
            dispatch({type: AudioAction.ADD_FILE, file: req.file})
            setForbidden(true)
            setMessage('file uploaded')
            setTitle(defaultTitle)
            console.log()
        } else {
            console.log('error uploading')
        }
    }

    return (
        <Grid item {...styles.grid}>
            <Paper  {...styles.paper}>
                {forbidden ? (
                    <div {...getRootProps({className: "dropzone"})} title="Drop audio file here">
                        <input  {...getInputProps({accept: "audio/*"})}/>
                        <IconButton title={"Click to open audio file"}>
                            <AddCircleOutlineIcon  {...styles.btn} sx={{fontSize: "7rem"}}/>
                        </IconButton>
                        <Typography variant="subtitle1"
                                    color="text.secondary"> {isDragActive ? "drop" : title} </Typography>
                    </div>
                ) : (<>
                        <IconButton onClick={handleUpload}>
                            <FileUploadIcon color="success" sx={{
                                fontSize: "8rem",
                                borderRadius: "4rem",
                            }}/>
                        </IconButton>
                        <Typography variant="body2"> {title} </Typography>
                    </>
                )}
            </Paper>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
        </Grid>
    )
}