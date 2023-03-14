import {useEffect} from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function HomePage() {
    useEffect(() => {
        document.title = 'SounDream | Home'
    }, [])
    return (
        <>
            <Header/>
            <div className='content'> content </div>
            <Footer/>
        </>
    )
}