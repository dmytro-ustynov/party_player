import Login from "./auth/Login/Login";
import BrandLogo from "./BrandLogo";

export default function Header(props) {
    const {displayLogin = true} = props

    return (
        <header className="top-header">
            <div className="header-left-menu">
                <BrandLogo/>
            </div>
            {displayLogin && <Login/>}
        </header>
    )
}