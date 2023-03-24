import {createContext, useContext, useReducer} from "react";
import {AudioAction} from "./actions";


const audioState = {
    files : [],
    sound: null,
    loading: null,
    errorMessage: null,
    wavesurfer : null,
}

const AudioReducer = ( audioState, action ) => {
    switch (action.type){
        case AudioAction.SET_FILES:
            return {
                ...audioState,
                files: action.files}
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
            return{
                ...audioState,
                wavesurfer: action.wavesurfer
            }
        default:
            return audioState
    }
}
const AudioContext = createContext()

export function useAudioState(){
    const context = useContext(AudioContext)
    if (context === undefined){
        throw new Error("useAudioContext must be used inside AudioProvider")
    }
    return context
}
export function AudioProvider (props) {

    const [audio, dispatch] = useReducer(AudioReducer, audioState)

    return(
        <AudioContext.Provider value={{audio, dispatch}}>
            {props.children}
        </AudioContext.Provider>
    )
}