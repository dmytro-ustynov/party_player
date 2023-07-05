import Typography from "@mui/material/Typography";
import {useState} from "react";
import {Roles} from "./auth/context";
import {pink} from '@mui/material/colors';


import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from "@mui/icons-material/Done";
import CustomLevel from "./customLevel";


export default function Tiers() {
    const [selectedTier, setSelectedTier] = useState(2)
    const TIERS = {1: Roles.ANONYMOUS, 2: Roles.REGISTERED, 3: Roles.PREMIUM}

    const selectTier = (number) => {
        const others = document.querySelectorAll(".tier-example")
        others.forEach(div => div.classList.remove('active'))
        const div = document.querySelector(`#tier-${number}`)
        div.classList.add('active')
        const otherNames = document.querySelectorAll(".tier-name")
        otherNames.forEach(div=>div.classList.remove('selected'))
        const nameDiv = document.querySelector(`#tier-name-${number}`)
        nameDiv.classList.add('selected')
        setSelectedTier(number)
    }
    return (
        <div>
            <div className="header-tier">
                <Typography variant='h3' color={"white"}>Choose your best option to start!</Typography>
            </div>
            <div className="tiers-block">
                <div id="tier-1" className="tier-example" onClick={() => selectTier(1)}>
                    <div id="tier-name-1" className="tier-name">Anonymous</div>
                    <ul className="tier-options-list">
                        <li>Files amount</li>
                        <div style={{height: "9vh"}}>
                            <CustomLevel n={5} text={'5 files'}
                                         fill={0.2}
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/></div>
                        <li>Storage time: 3 days only</li>

                        <li>Available formats:</li>
                        <ul className="tier-options-list">
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> mp3</li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> wav
                            </li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> webm</li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> flac
                            </li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> wma
                            </li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> ogg
                            </li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> aac
                            </li>
                        </ul>
                        <li style={{paddingTop: "15px"}}>Microphone record duration</li>
                        <div style={{height: "9vh"}}>
                            <CustomLevel n={5}
                                         text='150 sec'
                                         fill={0.3}
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/></div>
                        <li>Advertising level</li>
                        <div style={{height: "7vh"}}>
                            <CustomLevel n={5}
                                         text='high'
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/>
                        </div>
                        <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}} fontSize="small"/>Library
                            search
                        </li>
                        <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}} fontSize="small"/>Download
                            from YouTube
                        </li>
                        <div className="option-cost"> FREE</div>
                    </ul>
                </div>
                <div id="tier-2" className="tier-example active" onClick={() => selectTier(2)}>
                    <div id="tier-name-2" className="tier-name selected">Registered</div>
                    <ul className="tier-options-list">
                        <li>Files amount</li>
                        <div style={{height: "9vh"}}>
                            <CustomLevel n={5} text={'40 files'}
                                         fill={0.6}
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/>
                        </div>
                        <li>Storage time: until deleted</li>

                        <li>Available formats:</li>
                        <ul>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> mp3</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> wav</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> webm</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> flac</li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> wma
                            </li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> ogg
                            </li>
                            <li className="tier-option option-false"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> aac
                            </li>
                        </ul>
                        <li style={{paddingTop: "15px"}}>Microphone record duration</li>
                        <div style={{height: "9vh"}}>
                            <CustomLevel n={5}
                                         text='10 min'
                                         fill={0.6}
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/></div>
                        <li>Advertising level</li>
                        <div style={{height: "7vh"}}>
                            <CustomLevel n={5}
                                         text='medium'
                                         fill={0.6}
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/>
                        </div>
                        <li className="tier-option option-true"><DoneIcon fontSize="small"/>Library search</li>
                        <li className="tier-option option-true"><DoneIcon fontSize="small"/>Download from YouTube</li>
                        <div className="option-cost"> FREE</div>
                    </ul>
                </div>
                <div id="tier-3" className="tier-example" onClick={() => selectTier(3)}>
                    <div id="tier-name-3" className="tier-name">Premium</div>
                    <ul className="tier-options-list">
                        <li>Files amount</li>
                        <div style={{height: "9vh"}}>
                            <CustomLevel n={7} text={'120 files'}
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/>
                            <div className="mt-10">Up to 120 files in your media library</div>
                        </div>
                        <li>Storage time: until deleted</li>

                        <li>Available formats:</li>
                        <ul>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> mp3</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> wav</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> webm</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> flac</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> wma</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> ogg</li>
                            <li className="tier-option option-true"><DoneIcon fontSize="small"/> aac</li>
                        </ul>
                        <li style={{paddingTop: "15px"}}>Microphone record duration</li>
                        <div style={{height: "9vh"}}>
                            <CustomLevel n={7}
                                         text='60 min '
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/>
                            <div className="mt-10"> Up to 1 hour recording !</div>
                        </div>
                        <li>Advertising level</li>
                        <div style={{height: "7vh"}}>
                            <CustomLevel n={5}
                                         text='NO'
                                         fill={0}
                                         width={90}
                                         color="#FE753B"
                                         emptyColor="#B4968DFF"/>
                            <li className="tier-option option-false mt-10"><CloseIcon sx={{color: pink[500]}}
                                                                                fontSize="small"/> NO ADVERTISING !
                            </li>
                        </div>
                        <li className="tier-option option-true"><DoneIcon fontSize="small"/>Library search</li>
                        <li className="tier-option option-true"><DoneIcon fontSize="small"/>Download from YouTube</li>
                    <div className="option-cost"> $ 7.99 / month </div>
                    </ul>
                </div>
            </div>
        </div>

    )
}