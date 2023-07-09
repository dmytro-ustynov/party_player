import {
    Button, Dialog,
    DialogActions, DialogContent,
    DialogContentText,
    DialogTitle,
    Divider, FormControl, FormHelperText, InputLabel,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem, TextField, Typography
} from "@mui/material";
import Select from '@mui/material/Select';
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import React, {useEffect, useState} from "react";
import {useAudioState} from "./audioReducer";
import {AudioAction} from "./actions";
import {DELETE_FILE_URL, SAVEAS_URL} from "../../utils/constants";
import {download, fetcher} from "../../utils/fetch_utils";
import {useNavigate} from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import LoadingButton from "@mui/lab/LoadingButton";
import {Roles, useAuthState} from "../auth/context";
import Link from "@mui/material/Link";

export default function FileMenu({anchorEl, setAnchorEl}) {
    const {audio, dispatch} = useAudioState()
    const {loading, sound} = audio
    const {filename} = audio.info

    const [downloadFilename, setDownloadFilename] = useState('')
    const state = useAuthState()
    const user = state.user
    const tierDetails = user.tier_details
    const [message, setMessage] = useState('')
    const openFileSubmenu = Boolean(anchorEl);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [saveAsOpen, setSaveAsOpen] = useState(false)
    const [downloadFormat, setDownloadFormat] = useState('')
    const [formatSelectOpen, setFormatSelectOpen] = useState(false)
    const [formatErrorMessage, setFormatErrorMessage] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        setDownloadFilename(filename)
    }, [filename])

    const handleFileClose = () => {
        setAnchorEl(null);
    };

    const saveAsFile = async (format) => {
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = SAVEAS_URL
        const data = {'file_id': sound, 'format': format}
        const file = await fetcher({url, payload: data, credentials: true, asFile: true})
        if (file instanceof Blob) {
            const name = downloadFilename.split('.')[0]
            download(file, `${name}.${format}`)
            setMessage('download complete')
        } else {
            console.log(file)
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }
    const saveAsMP3 = () => {
        if (!tierDetails.formats.includes('mp3')) {
            setMessage('Sorry, this file format is not allowed in you subscribe tier')
        } else {
            setMessage('')
            dispatch({type: AudioAction.SET_LOADING, loading: true})
            saveAsFile('mp3')
            handleFileClose()
        }
    }
    const saveAsWAV = () => {
        if (!tierDetails.formats.includes('wav')) {
            setMessage('Sorry, this file format is not allowed in you subscribe tier')
        } else {
            setMessage('')
            dispatch({type: AudioAction.SET_LOADING, loading: true})
            saveAsFile('wav')
            handleFileClose()
        }
    }
    const saveAsFLAC = () => {
        if (!tierDetails.formats.includes('flac')) {
            setMessage('Sorry, this file format is not allowed in you subscribe tier')
        } else {
            setMessage('')
            dispatch({type: AudioAction.SET_LOADING, loading: true})
            saveAsFile('flac')
            handleFileClose()
        }
    }
    const handleDelete = async () => {
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = DELETE_FILE_URL + sound
        const response = await fetcher({url, credentials: true, method: "DELETE"})
        if (response.result === true) {
            navigate('/')
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }
    const handleClose = () => {
        setDeleteConfirmationOpen(false)
        setSaveAsOpen(false)
        setDownloadFormat('')
        setFormatErrorMessage('')
        dispatch({type: AudioAction.SET_LOADING, loading: false})
        handleFileClose()
    }

    const handleFormatChange = (event) => {
        setDownloadFormat(event.target.value);
        if (!tierDetails.formats.includes(event.target.value)) {
            setFormatErrorMessage('This format is not allowed in your tier.')
        } else {
            setFormatErrorMessage('')
        }
    };

    const handleSelectClose = () => {
        setFormatSelectOpen(false);
    };

    const handleSelectOpen = () => {
        setFormatSelectOpen(true);
    };

    const downloadFile = () => {
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        saveAsFile(downloadFormat)
        handleClose()
        handleFileClose()
    }
    return (
        <>
            <Dialog open={deleteConfirmationOpen}
                    onClose={handleClose}>
                <DialogTitle>Confirm delete</DialogTitle>
                <DialogContentText>
                    Confirm deleting this file
                </DialogContentText>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleDelete}
                            startIcon={<DeleteIcon/>}
                            color="error"
                            variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={saveAsOpen}
                    onClose={handleClose}>
                <DialogTitle>Download this file as...</DialogTitle>
                <DialogContent>
                    {user.role !== Roles.PREMIUM && <>
                        <Typography variant="body2"><Link href="/welcome#tiers">Compare </Link>different Tiers and
                            discover benefits you can
                            get!</Typography>
                    </>
                    }
                    <FormControl sx={{mt: 3, minWidth: 120, minHeight: 95}} error={!!formatErrorMessage}>
                        <div style={{display: 'flex', columnGap: 0.5}}>
                            <><TextField id="standard-basic"
                                         value={downloadFilename}
                                         onChange={event => setDownloadFilename(event.target.value)}
                                         label="File name"
                                         variant="outlined"/>
                            </>
                            <div>
                                <InputLabel id="format-select-label" sx={{left: 'unset'}}>Format</InputLabel>
                                <Select
                                    id="format-select"
                                    labelId="format-select-label"
                                    open={formatSelectOpen}
                                    onClose={handleSelectClose}
                                    onOpen={handleSelectOpen}
                                    value={downloadFormat}
                                    label={<label sx={{left: 'unset'}}>Format</label>}
                                    sx={{minWidth: '6rem'}}
                                    onChange={handleFormatChange}
                                >
                                    <MenuItem value='mp3'>mp3</MenuItem>
                                    <MenuItem value='wav'>wav</MenuItem>
                                    <MenuItem value='webm'>webm</MenuItem>
                                    <MenuItem value='flac'>flac</MenuItem>
                                    <MenuItem value='ogg'>ogg</MenuItem>
                                    <MenuItem value='wma'>wma</MenuItem>
                                    <MenuItem value='aac'>aac</MenuItem>
                                </Select></div>
                        </div>
                        <FormHelperText>{formatErrorMessage}</FormHelperText>
                    </FormControl>
                    <div className="adv-place-horizontal-modal"></div>
                </DialogContent>
                <DialogActions sx={{m: '2rem'}}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <LoadingButton loading={loading}
                                   disabled={loading || !!formatErrorMessage || !downloadFormat}
                                   onClick={downloadFile}
                                   variant="contained"
                                   color="success">
                        <DownloadIcon fontSize="small"/>Download</LoadingButton>
                </DialogActions>
            </Dialog>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
            <Menu id="basic-menu"
                  sx={{width: 320, maxWidth: '100%'}}
                  anchorEl={anchorEl}
                  open={openFileSubmenu}
                  onClose={handleFileClose}
                  MenuListProps={{
                      'aria-labelledby': 'basic-button',
                  }}>
                <MenuItem onClick={saveAsMP3} disabled={loading}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Save as MP3</ListItemText>
                </MenuItem>
                <MenuItem onClick={saveAsWAV} disabled={loading}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Save as WAV</ListItemText>
                </MenuItem>
                <MenuItem onClick={saveAsFLAC} disabled={loading}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Save as FLAC</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setSaveAsOpen(true)
                }} disabled={loading}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Save as ...</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => setDeleteConfirmationOpen(true)}
                          disabled={loading}>
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
        </>
    )
}