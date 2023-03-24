import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Link from "@mui/material/Link";
import {
    Button,
    CircularProgress,
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
import {BASE_URL, DELETE_FILE_URL, SAVEAS_URL, UPDATE_FILENAME_URL} from "../utils/constants";
import {fetcher, download} from "../utils/fetch_utils";
import SideTab from "../components/SideTab";
import AudioRedactor from "../components/audio/AudioRedactor";

const FONT_SIZE = 9
const DEFAULT_INPUT_WIDTH = 200

export default function RedactorPage() {
    const {audio} = useAudioState()
    const [filename, setFilename] = useState('')
    const [updatedFilename, setUpdatedFilename] = useState('')
    const [info, setInfo] = useState({})
    const [message, setMessage] = useState('')
    const [inputWidth, setInputWidth] = useState(200)
    const sound = audio.sound
    const navigate = useNavigate()
    const [anchorFileEl, setAnchorFileEl] = useState(null);
    const openFileSubmenu = Boolean(anchorFileEl);
    const [pendingRequest, setPendingRequest] = useState(false)
    const handleFileClick = (event) => {
        setAnchorFileEl(event.currentTarget);
    };
    const handleFileClose = () => {
        setAnchorFileEl(null);
    };

    useEffect(() => {
        if (updatedFilename.length * FONT_SIZE > DEFAULT_INPUT_WIDTH) {
            setInputWidth((updatedFilename.length + 2) * FONT_SIZE)
        } else {
            setInputWidth(DEFAULT_INPUT_WIDTH)
        }
    }, [updatedFilename])

    useEffect(() => {
        const loadInfo = async () => {
            const url = BASE_URL + '/audio/?file_id=' + sound
            const req = await fetcher({url, method: "GET"})
            setInfo(req)
            setFilename(req.filename)
            setUpdatedFilename(req.filename)
        }
        document.title = 'SounDream | Redactor'
        if (sound) {
            loadInfo()
        }
    }, [sound])

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
                // todo: save updated filename in audio state
                // setInfo({...info, filename: response.filename})
                setFilename(response.filename)
                setMessage('filename changed')
            }
            console.log(response)
        }
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
                                    <Button {...styles.btn} endIcon={<KeyboardArrowDownIcon/>}>Effects</Button>
                                    <Button {...styles.btn} endIcon={<KeyboardArrowDownIcon/>}>Help</Button>
                                </Stack>
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

                                    <MenuItem onClick={handleDelete} disabled={pendingRequest}>
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