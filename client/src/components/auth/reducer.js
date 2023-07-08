import {v4 as uuidv4} from 'uuid';
import {fetcher} from "../../utils/fetch_utils";
import {ACCESS_TOKEN_KEY, BASE_URL, CURRENT_USER_KEY} from "../../utils/constants";

let user
let token
const anonymousTier = {
    max_files: 5,
    formats: ['mp3', 'webm'],
    mic_length: 150,
    adv_ratio: 5,
    file_size: 10
}
const getCookie = function (name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
}

const init = async () => {
    user = localStorage.getItem(CURRENT_USER_KEY)
        ? JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
        : "";
    const uid = user.user_id || uuidv4();
    if (!Boolean(user)) {
        user = {
            user_id: uid,
            role: 'anonymous',
            tier_details: anonymousTier
        }
    }
    const storageToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const cookieToken = getCookie(ACCESS_TOKEN_KEY)
    token = cookieToken || storageToken
    const url = BASE_URL + `/users/temporary_access?user_id=${uid}`
    if (!token) {
        const tokenData = await fetcher({url, credentials: true, method: "GET"})
        token = tokenData.access_token ? tokenData.access_token : ''
        user = tokenData.user
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

init()

export const initialState = {
    user: "" || user,
    accessToken: "" || token,
    loading: false,
    errorMessageLogin: null,
    errorMessageRegister: null,
};

export const authTypes = {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    UPDATE_USER: 'UPDATE_USER',
    LOGIN_ERROR: 'LOGIN_ERROR',
    LOGOUT: 'LOGOUT',
}

export const AuthReducer = (initialState, action) => {
    switch (action.type) {
        case authTypes.LOGIN_SUCCESS:
            return {
                ...initialState,
                user: action.payload.user,
                accessToken: action.payload.access_token,
                loading: false,
                errorMessageLogin: null
            };
        case authTypes.UPDATE_USER:
            return {
                ...initialState,
                user: action.payload.user,
                loading: false
            }
        case authTypes.LOGIN_ERROR:
            return {
                ...initialState,
                loading: false,
                errorMessageLogin: action.error,
            };
        case authTypes.LOGOUT:
            return {
                ...initialState,
                user: {
                    role: 'anonymous',
                    tier_details: anonymousTier
                },
                accessToken: null,
                errorMessageLogin: null,
            };

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};