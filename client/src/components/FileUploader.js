import {Grid, Paper} from "@mui/material";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {useDropzone} from "react-dropzone";
import Typography from "@mui/material/Typography";
import {useCallback, useState} from "react";
import {UPLOAD_FILE_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {useAuthState} from "./auth/context";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";

function validateAudioFile(file) {
    // Define the maximum file size (in bytes)
    const maxSize = 15 * 1024 * 1024; // 15MB in bytes

    // Define the allowed file types
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/x-m4a"];

    // Get the file size and type
    const fileSize = file.size;
    const fileType = file.type;

    // Check if the file size is within the allowed limit
    if (fileSize > maxSize) {
        return "File size exceeds the maximum limit of 15MB.";
    }

    // Check if the file type is allowed
    if (!allowedTypes.includes(fileType)) {
        return "File type not allowed. Please upload an audio file in MP3, WAV, or OGG format.";
    }

    // Return null if the file passes both checks
    return null;
}

const defaultTitle = 'drag file here'
export default function FileUploader(props) {
    const [file, setFile] = useState([])
    const [title, setTitle] = useState(defaultTitle)
    const [forbidden, setForbidden] = useState(true)
    const {styles} = props
    const state = useAuthState()
    const {dispatch} = useAudioState()
    const user = state.user


    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0]
        const errMessage = validateAudioFile(file)
        console.log(file)
        if (!errMessage) {
            setFile(file)
            setForbidden(false)
            setTitle(file.name)
            console.log('ready to upload')
            console.log(file)
        } else {
            setTitle(errMessage)
        }
        console.log(errMessage)

    }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
    const handleUpload = async () => {
        const url = UPLOAD_FILE_URL + "?user_id=" + user.user_id
        const body = new FormData()
        body.append('audiofile', file)
        // body.append('user_id', user.user_id)
        const req = await fetcher({url, credentials: true, body})
        if (req.result === true) {
            dispatch({type: AudioAction.ADD_FILE, file: req.file})
            setForbidden(true)
            setTitle(defaultTitle)
        } else {
            console.log('error uploading')
        }
        console.log(req)
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
                        <Typography variant="subtitle1" color="text.secondary"> {isDragActive ? "drop" : title} </Typography>
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
        </Grid>
    )
}