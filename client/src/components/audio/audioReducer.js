import {createContext, useContext, useReducer} from "react";
import {AudioAction} from "./actions";


const audioState = {
    files: [],
    sound: null,
    info: {},
    loading: null,
    errorMessage: null,
    wavesurfer: null,
    selection: null,
    currentTime: 0,
}

const AudioReducer = (audioState, action) => {
    switch (action.type) {
        case AudioAction.SET_FILES:
            return {
                ...audioState,
                files: action.files
            }
        case AudioAction.ADD_FILE:
            return {
                ...audioState,
                files: [...audioState.files, action.file]
            }
        case AudioAction.SET_SOUND:
            return {
                ...audioState,
                sound: action.soundId
            }
        case AudioAction.SET_LOADING:
            return {
                ...audioState,
                loading: action.loading
            }
        case AudioAction.SET_WAVESURFER:
            return {
                ...audioState,
                wavesurfer: action.wavesurfer
            }
        case AudioAction.ADD_SELECTION:
            return {
                ...audioState,
                selection: action.selection
            }
        case AudioAction.UPDATE_FILE_INFO:
            return {
                ...audioState,
                info: action.info
            }
        case AudioAction.SET_CURRENT_TIME:
            return {
                ...audioState,
                currentTime: action.time
            }

        default:
            return audioState
    }
}
const AudioContext = createContext()

export function useAudioState() {
    const context = useContext(AudioContext)
    if (context === undefined) {
        throw new Error("useAudioContext must be used inside AudioProvider")
    }
    return context
}

export function AudioProvider(props) {

    const [audio, dispatch] = useReducer(AudioReducer, audioState)

    return (
        <AudioContext.Provider value={{audio, dispatch}}>
            {props.children}
        </AudioContext.Provider>
    )
}