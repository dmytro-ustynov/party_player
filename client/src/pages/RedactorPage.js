import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Link from "@mui/material/Link";
import {
    Button,
    CircularProgress, Dialog, DialogActions, DialogContentText, DialogTitle,
    Divider,
    Grid, IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    TextField
} from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import InputAdornment from '@mui/material/InputAdornment';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';

import Header from "../components/Header";
import Footer from "../components/Footer";
import {useAudioState} from "../components/audio/audioReducer";
import {
    AudioOperation,
    BASE_URL,
    DELETE_FILE_URL,
    OPERATION_URL,
    SAVEAS_URL,
    UPDATE_FILENAME_URL
} from "../utils/constants";
import {fetcher, download} from "../utils/fetch_utils";
import SideTab from "../components/SideTab";
import AudioRedactor from "../components/audio/AudioRedactor";
import {AudioAction} from "../components/audio/actions";

const FONT_SIZE = 10
const DEFAULT_INPUT_WIDTH = 200

export default function RedactorPage() {
    const {audio, dispatch} = useAudioState()
    const info = audio.info
    const [filename, setFilename] = useState('')
    const [updatedFilename, setUpdatedFilename] = useState('')
    const [message, setMessage] = useState('')
    const [inputWidth, setInputWidth] = useState(200)
    const sound = audio.sound
    const navigate = useNavigate()
    const [anchorFileEl, setAnchorFileEl] = useState(null);
    const [anchorEffectsEl, setAnchorEffectsEl] = useState(null);
    const openFileSubmenu = Boolean(anchorFileEl);
    const openEffectsSubmenu = Boolean(anchorEffectsEl);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [pendingRequest, setPendingRequest] = useState(false)
    const handleFileClick = (event) => {
        setAnchorFileEl(event.currentTarget);
    };
    const handleFileClose = () => {
        setAnchorFileEl(null);
    };
    const handleEffectsClick = (event) => {
        setAnchorEffectsEl(event.currentTarget);
    };
    const handleEffectsClose = () => {
        setAnchorEffectsEl(null);
    };

    useEffect(() => {
        if (updatedFilename.length * FONT_SIZE > DEFAULT_INPUT_WIDTH) {
            setInputWidth((updatedFilename.length + 1) * FONT_SIZE)
        } else {
            setInputWidth(DEFAULT_INPUT_WIDTH)
        }
    }, [updatedFilename])

    useEffect(() => {
        if (!sound) {
            const urlParams = new URLSearchParams(window.location.search);
            const soundId = urlParams.get('file_id')
            dispatch({type: AudioAction.SET_SOUND, soundId})
        }
        const loadInfo = async () => {
            const url = BASE_URL + '/audio/?file_id=' + sound
            const response = await fetcher({url, method: "GET"})
            dispatch({type: AudioAction.UPDATE_FILE_INFO, info: response})
            setFilename(response.filename)
            setUpdatedFilename(response.filename)
        }
        document.title = 'SounDream | Redactor'
        if (sound) {
            loadInfo()
        }
    }, [sound, dispatch])

    const styles = {
        btn: {
            variant: "text",
            color: "secondary"
        }
    }
    const saveAsFile = async (format) => {
        setPendingRequest(true)
        const url = SAVEAS_URL
        const data = {'file_id': sound, 'format': format}
        const file = await fetcher({url, payload: data, credentials: true, asFile: true})
        if (file instanceof Blob) {
            const name = filename.split('.')[0]
            download(file, `${name}.${format}`)
            setMessage('download complete')
        } else {
            console.log(file)
        }
        setPendingRequest(false)
    }
    const saveAsMP3 = () => {
        setPendingRequest(true)
        saveAsFile('mp3')
        handleFileClose()
    }
    const saveAsWAV = () => {
        setPendingRequest(true)
        saveAsFile('wav')
        handleFileClose()
    }
    const saveAsFLAC = () => {
        setPendingRequest(true)
        saveAsFile('flac')
        handleFileClose()
    }

    const handleDelete = async () => {
        setPendingRequest(true)
        const url = DELETE_FILE_URL + sound
        const response = await fetcher({url, credentials: true, method: "DELETE"})
        if (response.result === true) {
            navigate('/')
        }
        setPendingRequest(false)
    }

    const submitFileNameUpdate = async () => {
        const url = UPDATE_FILENAME_URL
        console.log(updatedFilename)
        if (updatedFilename.length > 0) {
            const response = await fetcher({
                url,
                payload: {filename: updatedFilename, file_id: sound},
                credentials: true
            })
            if (response.result === true) {
                dispatch({type: AudioAction.UPDATE_FILE_INFO, info: {...info, filename: response.filename}})
                setFilename(response.filename)
                setMessage('filename changed')
            }
            console.log(response)
        }
    }
    const handleDenoise = async () => {
        console.log('denoisinng....')
        setPendingRequest(true)
        const url = OPERATION_URL
        const payload = {action: AudioOperation.DENOISE, file_id: sound}
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setMessage('Denoise Complete')
        } else {
            setMessage(response.details)
        }
        setPendingRequest(false)
    }

    const handleClose = () => {
        setDeleteConfirmationOpen(false)
    }
    return (
        <>
            <Header/>
            <div className="redactor-content">
                <SideTab info={info}/>
                {sound ? (<div style={{display: "block", flexGrow: 1}}>
                            <div className="file-menu">
                                <Stack direction="row" spacing={4}>
                                <span style={{minWidth: "40px", minHeight: "45px"}}>
                                    {pendingRequest && <CircularProgress color='secondary'/>}
                                </span>
                                    <Button {...styles.btn}
                                            onClick={handleFileClick}
                                            endIcon={<KeyboardArrowDownIcon/>}>
                                        File
                                    </Button>
                                    <Button {...styles.btn} onClick={handleEffectsClick}
                                            endIcon={<KeyboardArrowDownIcon/>}>Effects</Button>
                                    <Button {...styles.btn} endIcon={<KeyboardArrowDownIcon/>}>Help</Button>
                                </Stack>
                                <Dialog open={deleteConfirmationOpen}
                                        onClose={handleClose}>
                                    <DialogTitle>Confirm delete</DialogTitle>
                                    <DialogContentText>
                                        Confirm deleting this file
                                    </DialogContentText>
                                    <DialogActions>
                                        <Button onClick={handleClose}>Cancel</Button>
                                        <Button onClick={handleDelete}
                                                startIcon={<DeleteIcon />}
                                                color="error"
                                                variant="contained">Delete</Button>
                                    </DialogActions>
                                </Dialog>
                                <Menu id="basic-menu"
                                      sx={{width: 320, maxWidth: '100%'}}
                                      anchorEl={anchorFileEl}
                                      open={openFileSubmenu}
                                      onClose={handleFileClose}
                                      MenuListProps={{
                                          'aria-labelledby': 'basic-button',
                                      }}>
                                    <MenuItem onClick={saveAsMP3} disabled={pendingRequest}>
                                        <ListItemIcon>
                                            <DownloadIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Save as MP3</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={saveAsWAV} disabled={pendingRequest}>
                                        <ListItemIcon>
                                            <DownloadIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Save as WAV</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={saveAsFLAC} disabled={pendingRequest}>
                                        <ListItemIcon>
                                            <DownloadIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Save as FLAC</ListItemText>
                                    </MenuItem>

                                    <MenuItem onClick={() => setDeleteConfirmationOpen(true)}
                                              disabled={pendingRequest}>
                                        <ListItemIcon>
                                            <DeleteIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Delete</ListItemText>
                                    </MenuItem>
                                    <Divider/>
                                    <MenuItem onClick={handleFileClose}>
                                        <ListItemIcon>
                                            <ShareIcon fontSize="small"/>
                                        </ListItemIcon>
                                        <ListItemText>Share</ListItemText>
                                    </MenuItem>
                                </Menu>
                                <Menu id="effects-menu"
                                      sx={{width: 320, maxWidth: '100%'}}
                                      anchorEl={anchorEffectsEl}
                                      open={openEffectsSubmenu}
                                      onClose={handleEffectsClose}
                                      MenuListProps={{
                                          'aria-labelledby': 'basic-button',
                                      }}>
                                    <MenuItem onClick={handleDenoise}>
                                        <ListItemIcon>
                                            N
                                        </ListItemIcon>
                                        <ListItemText>Denoise</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </div>
                            <Snackbar
                                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                                open={!!message}
                                onClose={() => setMessage(null)}
                                message={message}/>
                            <Grid container>
                                <Grid item id='filename-input'>
                                    <TextField value={updatedFilename}
                                               fullWidth
                                               variant='standard' sx={{width: '300px'}}
                                               onChange={(e) => setUpdatedFilename(e.target.value)}
                                               InputProps={{
                                                   style: {width: `${inputWidth}px`},
                                                   endAdornment: (<InputAdornment position="end">
                                                       <IconButton
                                                           onClick={submitFileNameUpdate}
                                                           edge="end"
                                                           disabled={updatedFilename.length === 0 || filename === updatedFilename}
                                                           title={filename === updatedFilename ? "Changes saved" : 'Click to save changes'}>
                                                           <DoneIcon
                                                               color={filename === updatedFilename ? "default" : 'success'}/>
                                                       </IconButton>
                                                   </InputAdornment>)
                                               }}/>
                                </Grid>
                            </Grid>
                            <AudioRedactor/>
                        </div>
                    ) :
                    (<span>
                            <p>you should select sound </p>
                            <Link to={'/'} onClick={() => navigate('/')} sx={{cursor: 'pointer'}}> Home</Link>
                        </span>)
                }
            </div>
            <Footer/>
        </>
    )
}