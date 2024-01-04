import React, {useEffect, useState} from 'react'
import Header from "../components/Header";
import {fetcher} from "../utils/fetch_utils";
import {SHORTEN_URL} from "../utils/constants";

export default function PageNotFound() {
    const [loading, setLoading] = useState(null)


    useEffect(() => {
        const getLink = async () => {
            const alias = window.location.href.split('/')[3]
            const req = await fetcher({url: SHORTEN_URL + alias, method: "GET"})
            if (req.result === true){
                window.location.href = req.link
                setLoading(false)
            }
        }

        getLink()
    }, []);
    return (
        <>
            <Header/>
            <div>
                Error 404
            </div>
        </>
    )
}