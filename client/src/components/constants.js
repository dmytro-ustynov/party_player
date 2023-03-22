

export const BASE_URL = 'http://localhost:' + process.env.REACT_APP_SERVER_PORT

export const GET_FILE_URL = '/audio/get_file'

export const GET_AUDIO_URL = '/audio/get_audio/'

export const OPERATION_URL = '/audio/edit_sound'

export const UPDATE_FILENAME_URL = '/audio/update_file_name'

export const UPLOAD_FILE_URL = '/audio/upload_new_file'

export const MY_FILES_URL = '/audio/get_my_files'

export const SAVE_AS_URL = '/audio/save_as'

export const DELETE_SOUND_URL = '/audio/delete'

//AUTH constants and names
export const ACCESS_TOKEN_KEY = 'accessToken'

export const CURRENT_USER_KEY = 'currentUser'

//FILE constants

export const MAX_FILE_SIZE = 75 * 1024 * 1024

export const AUDIO_OPERATIONS = {
  // values must be the same as API methods: server/audio/routes.py
  CLEAR: 'clear',
  DELETE_FRAGMENT: 'delete_fragment',
  TRIM: 'trim',
  FADEIN: 'fadein',
  FADEOUT: 'fadeout',
  GAIN: 'gain',
  SPEEDUP: 'speedup',
  PASTE: 'paste',
  OVERLAY: 'overlay',
  INSERT_SILENCE: 'insert_silence',
}
