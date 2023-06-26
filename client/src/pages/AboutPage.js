import Header from "../components/Header";
import React, {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import Stack from '@mui/material/Stack';
import patreon_image from "../images/support_me_on_patreon.png";
import monobank_logo from "../images/mono_pay_icon.webp";
import paypal_logo from "../images/paypal-icon-blue-donation-logo.png";
import author_logo from "../images/UstynovDmytro.jpg";
import Link from "@mui/material/Link";
import {LinkedIn,} from "@mui/icons-material";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from "@mui/material/Snackbar";

export default function AboutPage() {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')

    const payPalLink = 'ustynov.dmitriy@gmail.com'

    useEffect(() => {
        document.title = 'SounDream | About'
    }, [])

    const handleClose = () => {
        setOpen(false)
    }

    const payPalToClipBoard = () => {
        navigator.clipboard.writeText(payPalLink);
        console.log('copied, try....')
        setMessage('Address copied to clipboard')
        handleClose()
    }

    return (
        <>
            <Header/>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Copy PayPal address link</DialogTitle>
                <DialogContent>

                    <TextField value={payPalLink}
                               fullWidth
                               InputProps={{
                                   startAdornment: (
                                       <InputAdornment position="start">
                                           <img src={paypal_logo} style={{height: '25px'}} alt="paypal"/>
                                       </InputAdornment>
                                   ),
                                   endAdornment: (
                                       <InputAdornment position="end">
                                           <IconButton onClick={payPalToClipBoard}>
                                               <ContentCopyIcon/>
                                           </IconButton>
                                       </InputAdornment>
                                   )
                               }}/>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <div className="content" style={{padding: "2rem 4rem"}}>
                <Typography variant="h4">Welcome to SounDream</Typography>
                <div style={{maxWidth: '960px'}}>
                    <Stack spacing={{sm: 2}} direction="row">
                        <img src={author_logo} alt="Dimon" style={{height: "230px", borderRadius: "8px"}} loading="lazy" />
                        <Stack>
                            <Typography variant="body1" sx={{textAlign: "left", m: 1}}>My name is Dmytro Ustynov, and I
                                am a Python developer from Ukraine. While my main specialization is backend software
                                development, I have recently ventured into the world of frontend development.
                            </Typography>
                            <Typography variant="body1" sx={{textAlign: "left", m: 1}}>However,
                                this change is not simply a career switch; I have also become a member of the Armed
                                Forces of Ukraine. In Ukraine, we refer to the Armed Forces as ЗСУ - Збройні сили
                                України.</Typography>
                            <Typography variant="body" sx={{textAlign: "left", m: 1}}>So, my "front" now encompasses
                                both ReactJS and my military service. Read the related article I've written about
                                it <Link rel="noreferrer" target="_blank"
                                         href="https://dreamproit.com/blog/2022-07-15-from-backend-to-front/index.html">
                                    here
                                </Link>.
                            </Typography>

                            <Typography variant="body1" sx={{textAlign: "left", m: 1}}>I initiated the development of
                                this application before the Russian invasion, and I recently completed it in July
                                2023. I kindly request your support and invite you to donate here.
                            </Typography>
                        </Stack>
                    </Stack>

                    <Typography variant="body1" sx={{textAlign: "left"}}>By contributing to this cause, you will be
                        directly helping us acquire the necessary telecommunication and equipment for the Military
                        Institute of Telecommunications and Informatization.</Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>
                        Thank you for considering supporting this project. Your generosity will make a significant
                        difference. Let's join forces to empower our military and enhance their capabilities!
                    </Typography>

                    <Typography variant="h5" sx={{textAlign: "center"}}>Stand with us and make a meaningful impact! We
                        offer you several options to contribute, allowing you to choose the most convenient way to
                        support our project and provide essential resources for the Military Institute of
                        Telecommunications and Informatization.</Typography>
                    <Typography variant="h5" sx={{textAlign: "center"}}>Together, we can fortify our forces and
                        safeguard
                        our nation.</Typography>
                    <Typography variant="h5" sx={{textAlign: "center", mt: 2}}>Explore the donation options available
                        and join us
                        in making a difference today!</Typography>
                    <Stack direction="row" spacing={4} sx={{justifyContent: 'center'}}>
                        <a href="https://patreon.com/user?u=95586488"><img src={patreon_image} alt="mono"
                                                                               style={{height: '50px'}}/></a>
                        <a href="https://send.monobank.ua/jar/2gTDiFo2Am" rel="noreferrer" target="_blank"><img
                            src={monobank_logo} style={{height: '50px'}} alt=""/></a>
                        <img src={paypal_logo} style={{height: '50px', cursor: 'pointer'}} alt=""
                             onClick={() => setOpen(true)}/>
                    </Stack>
                    <Typography variant="body1" sx={{textAlign: "left", mt: 3}}>You may also directly support one of the
                        most popular and powerful charity funds in Ukraine: <Link
                            href="https://prytulafoundation.org/en/donation" rel="noreferrer" target="_blank">"Serhiy
                            Prytula Foundation" </Link> or <Link
                            href="https://lifefoundation.com.ua/partners/en" rel="noreferrer" target="_blank">"Life
                            foundation"</Link>.</Typography>
                    <Typography variant="h6" sx={{textAlign: "center"}}>Find me on social media:</Typography>
                    <Stack direction="row" spacing={2} sx={{justifyContent: "center"}}>
                        <Link href="https://www.linkedin.com/in/dmytro-ustynov" rel="noreferrer"
                              target="_blank">
                            <LinkedIn fontSize="large"/>
                        </Link>
                        <Link href="https://www.facebook.com/DmitriyUstynov/" rel="noreferrer"
                              target="_blank">
                            <FacebookIcon fontSize="large"/>
                        </Link>
                        <Link href="https://instagram.com/dmytro.ustynov" rel="noreferrer"
                              target="_blank">
                            <InstagramIcon fontSize="large"/>
                        </Link>
                    </Stack>
                    <Typography variant='body2'>I am a <Link href="https://ithillel.ua/ru/coaches/dmitriy-ustinov"
                                                              rel="noreferrer"
                                                              target="_blank">teacher</Link> in Hillel IT School. I am
                        a <Link rel="noreferrer"
                                target="_blank" href='https://dreamproit.com/#team'>ML/AI Engineer</Link> in
                        DreamProIT.</Typography>
                </div>
            </div>
        </>
    )
}