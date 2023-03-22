
const PORT = process.env.REACT_APP_SERVER_PORT || 8008
const HOST = process.env.REACT_APP_SERVER_HOST || 'localhost'
export const BASE_URL = `http://${HOST}:${PORT}`
export const IMAGE_URL = BASE_URL + "/image/random"
export const YOUTUBE_LOAD_URL = BASE_URL + "/audio/get_from_youtube?url="
export const UPLOAD_FILE_URL = BASE_URL + "/audio/upload_file"
export const SAVEAS_URL = BASE_URL + "/audio/save_as"
export const DELETE_FILE_URL = BASE_URL + "/audio/file?file_id="
export const ACCESS_TOKEN_KEY = "access_token"
export const CURRENT_USER_KEY = "current_user"
