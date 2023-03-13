import {useEffect} from "react";

export default function HomePage() {
    useEffect(() => {
        document.title = 'SounDream | Home'
    }, [])
    return (
        <div>HOME page</div>
    )
}