
const PORT = process.env.REACT_APP_SERVER_PORT || 8008
const HOST = process.env.REACT_APP_SERVER_HOST || 'localhost'
export const BASE_URL = `http://${HOST}:${PORT}`
export const IMAGE_URL = BASE_URL + "/image/random"
export const YOUTUBE_LOAD_URL = BASE_URL + "/audio/get_from_youtube?url="
export const SEARCH_URL = "/items"
export const SAVE_NOTE_URL = "/save_note"
export const EXPORT_URL = "/export"
export const ADD_FIELD_URL = "/update"
export const ACCESS_TOKEN_KEY = "access_token"
export const CURRENT_USER_KEY = "current_user"
