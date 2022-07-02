import {ACCESS_TOKEN_KEY, BASE_URL, CURRENT_USER_KEY} from "../constants";
import {authTypes} from "./reducer";
import {fetcher} from "../utils/fetch_utils";
// import {setAudioFiesAction} from "../AudioPlayer/audioReducer";

const AUTH_URL = BASE_URL + '/auth'


export async function loginUser(dispatch, payload) {
  try {
    dispatch({ type: authTypes.REQUEST_LOGIN });
    const url = `${AUTH_URL}/login`
    let data = await fetcher({url, payload})
    if (data.user) {
      dispatch({ type: authTypes.LOGIN_SUCCESS, payload: data });
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      return data
    }

    dispatch({ type: authTypes.LOGIN_ERROR, error: data.errors });
    return data
  } catch (error) {
    dispatch({ type: authTypes.LOGIN_ERROR, error: error });
  }
  return {}
}

export async function registerUser(dispatch, registerPayload) {
  try {
    dispatch({ type: authTypes.REQUEST_REGISTER });
    console.log('register!')
    let data = fetcher(`${AUTH_URL}/register_user`, registerPayload)
    if (data.result) {
      dispatch({ type: authTypes.REGISTER_SUCCESS, payload: data });
    } else {
      dispatch({type: authTypes.REGISTER_ERROR, error: data.details});
    }
  return data
  } catch (error) {
    debugger;
    dispatch({ type: authTypes.REGISTER_ERROR, error: error });
  }
  return {}
}

export async function logout(dispatch) {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  dispatch({ type: authTypes.LOGOUT });
  await fetcher({url: AUTH_URL+'/logout'})
}