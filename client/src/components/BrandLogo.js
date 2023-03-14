import logoImage from "../images/logo_640.png";

export default function BrandLogo(){
    return(
        <img src={logoImage} alt={"logo"} className="image-logo"
                     onClick={() => {
                         window.location.replace("/")
                     }}/>
    )
}