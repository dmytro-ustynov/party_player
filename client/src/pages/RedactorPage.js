import React, {useEffect, useState} from "react";
import {
    Button,
    CircularProgress,
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
import DoneIcon from '@mui/icons-material/Done';

import Header from "../components/Header";
import Footer from "../components/Footer";
import {useAudioState} from "../components/audio/audioReducer";
import {
    AudioOperation,
    BASE_URL,
    OPERATION_URL,
    UPDATE_FILENAME_URL
} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import SideTab from "../components/SideTab";
import AudioRedactor from "../components/audio/AudioRedactor";
import {AudioAction} from "../components/audio/actions";
import FileMenu from "../components/audio/FileMenu";

const FONT_SIZE = 10
const DEFAULT_INPUT_WIDTH = 200

export default function RedactorPage() {
    const {audio, dispatch} = useAudioState()
    const loading = audio.loading
    const info = audio.info
    const [filename, setFilename] = useState('')
    const [updatedFilename, setUpdatedFilename] = useState('')
    const [message, setMessage] = useState('')
    const [inputWidth, setInputWidth] = useState(200)
    const sound = audio.sound
    const [anchorFileEl, setAnchorFileEl] = useState(null);
    const [anchorEffectsEl, setAnchorEffectsEl] = useState(null);
    const openEffectsSubmenu = Boolean(anchorEffectsEl);

    const handleFileClick = (event) => {
        setAnchorFileEl(event.currentTarget);
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
        dispatch({type: AudioAction.SET_LOADING, loading: true})
        const url = OPERATION_URL
        const payload = {action: AudioOperation.DENOISE, file_id: sound}
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setMessage('Denoise Complete')
        } else {
            setMessage(response.details)
        }
        dispatch({type: AudioAction.SET_LOADING, loading: false})
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
                                    {loading && <CircularProgress color='secondary'/>}
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
                                <FileMenu anchorEl={anchorFileEl}
                                          setAnchorEl={setAnchorFileEl}/>
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
                        </span>)
                }
            </div>
            <Footer/>
        </>
    )
}