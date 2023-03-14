import Login from "./auth/Login/Login";
import logoImage from "../images/logo_640.png"

export default function Header() {
    return (
        <header className="top-header">
            <div className="header-left-menu">
                <img src={logoImage} alt={"logo"} className="image-logo"
                     onClick={() => {
                         window.location.replace("/")
                     }}/>
            </div>
            <Login/>
        </header>
    )
}