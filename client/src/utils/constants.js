const PORT = process.env.REACT_APP_SERVER_PORT || 5000
const HOST = process.env.REACT_APP_SERVER_HOST || 'http://localhost'
let url
if (HOST.includes('localhost')) {
    url = `${HOST}:${PORT}`
} else{
    url = `${HOST}/api`
}
export const BASE_URL = url
export const IMAGE_URL = BASE_URL + "/image/random"
export const YOUTUBE_LOAD_URL = BASE_URL + "/audio/get_from_youtube?url="
export const UPLOAD_FILE_URL = BASE_URL + "/audio/upload_file"
export const SAVEAS_URL = BASE_URL + "/audio/save_as"
export const STREAM_UPLOAD_URL = BASE_URL + "/audio/record"
export const DELETE_FILE_URL = BASE_URL + "/audio/file?file_id="
export const UPDATE_FILENAME_URL = BASE_URL + "/audio/change_filename"
export const OPERATION_URL = BASE_URL + '/audio/modify'

export const LOGIN_PAGE_URL = '/login'
export const REFRESH_TOKEN_URl = BASE_URL + '/users/refresh_token'
export const CHANGE_PASSWORD_URL = BASE_URL + '/users/change_password'
export const UPDATE_PROFILE_URL = BASE_URL + '/users/update_profile'
export const GET_USER_INFO_URL = BASE_URL + '/users/info'
export const SHORTEN_URL = BASE_URL + '/short/'
export const ACCESS_TOKEN_KEY = "access_token"
export const CURRENT_USER_KEY = "current_user"

export const AudioOperation = {
    CLEAR: 'clear',
    DELETE_FRAGMENT: 'delete_fragment',
    TRIM: 'trim',
    FADE_IN: 'fade_in',
    FADE_OUT: 'fade_out',
    GAIN: 'gain',
    PASTE: 'paste',
    OVERLAY: 'overlay',
    INSERT_SILENCE: 'insert_silence',
    SPEEDUP: 'speedup',
    UNDO: 'undo',
    DENOISE: 'denoise',
}
