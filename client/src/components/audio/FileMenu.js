import {
    Button, Dialog,
    DialogActions,
    DialogContentText,
    DialogTitle,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import React, {useState} from "react";
import {useAudioState} from "./audioReducer";
import {AudioAction} from "./actions";
import {DELETE_FILE_URL, SAVEAS_URL} from "../../utils/constants";
import {download, fetcher} from "../../utils/fetch_utils";
import {useNavigate} from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";

export default function FileMenu({anchorEl, setAnchorEl}) {
    const {audio, dispatch} = useAudioState()
    const {loading, sound} = audio
    const {filename} = audio.info
    const [message, setMessage] = useState('')
    const openFileSubmenu = Boolean(anchorEl);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const navigate = useNavigate()

    const handleFileClose = () => {
        setAnchorEl(null);
    };

    const saveAsFile = async (format) => {
        dispatch({type: AudioAction.SET_LOADING, loading: true})
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
        dispatch({type: AudioAction.SET_LOADING, loading: false})
    }
    const saveAsMP3 = () => {
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        saveAsFile('mp3')
        handleFileClose()
    }
    const saveAsWAV = () => {
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        saveAsFile('wav')
        handleFileClose()
    }
    const saveAsFLAC = () => {
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        saveAsFile('flac')
        handleFileClose()
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