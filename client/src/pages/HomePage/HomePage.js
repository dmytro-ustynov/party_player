import React from 'react'
import {useAuthState} from "../../components/auth/context";


const HomePage = () => {
    const state = useAuthState()
    const user = state.user

    const welcomeMessage = user.role === 'anonymous' ? 'Login or register ': `Welcome, ${user.username}`
    return (
        <>
            <div>
            Home Page
            </div>
            <p> {welcomeMessage}</p>
        </>
    )
}

export default HomePage