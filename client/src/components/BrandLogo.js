import logoImage from "../images/logo_640.png";

export default function BrandLogo(){
    return(
        <a href="/">
            <img src={logoImage} alt={"logo"} className="image-logo"/>
        </a>
    )
}