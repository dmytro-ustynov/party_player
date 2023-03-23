import {Typography} from "@mui/material";
import Header from "../components/Header";
import React from "react";
import Footer from "../components/Footer";

export default function TermsOfUsePage() {

    return (
        <>
            <Header/>
            <div className="content" style={{padding: "2rem 4rem", width: "100%"}}>
                <div style={{maxWidth: '960px'}}>
                    <Typography variant="h5">Terms of Use</Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>By uploading any sound recording or music to
                        our
                        web application, you
                        represent and warrant that you have the necessary rights to use and upload the content,
                        including
                        any
                        necessary copyright permissions. You acknowledge and agree that you are solely responsible for
                        any
                        content that you upload or otherwise make available through our web application. We are not
                        responsible
                        for the content that users upload or transmit through our web application.
                    </Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>You agree to indemnify, defend, and hold us
                        harmless from and against
                        any
                        and all claims, damages, liabilities, costs, and expenses, including attorneys' fees, arising
                        from
                        or
                        related to any content that you upload or otherwise make available through our web application.
                        You
                        further agree to release us from any and all claims, damages, liabilities, and causes of action
                        arising
                        from or related to any content that you upload or otherwise make available through our web
                        application.
                    </Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>We reserve the right to remove any content that
                        violates these Terms of
                        Use
                        or any applicable laws, regulations, or policies. We may also terminate your access to our web
                        application if you violate these Terms of Use or if we receive a valid complaint regarding your
                        use
                        of
                        our web application.</Typography>
                    <Typography variant="h5">User Agreement</Typography>

                    <Typography variant="body1" sx={{textAlign: "left"}}>This User Agreement ("Agreement") is a legal
                        agreement between you
                        ("User") and "SounDream Ukraine"
                        ("Company") governing the use of SounDream ("Application").</Typography>

                    <Typography variant="body1" sx={{textAlign: "left"}}>By using the Application, User agrees to be
                        bound
                        by the terms of this
                        Agreement.</Typography>

                    <Typography variant="h6">1. User Content</Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>User is solely responsible for any audio files
                        or
                        other content ("User
                        Content") uploaded or otherwise provided through the Application. User represents and warrants
                        that
                        User has all necessary rights to use and upload the User Content, including any necessary
                        licenses,
                        permissions, or consents from any third parties.
                    </Typography>
                    <Typography variant="h6">2. Storage and Backup</Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>User acknowledges and agrees that Company has
                        no
                        obligation to store or
                        backup User Content. Company
                        may, at its sole discretion, choose to delete or remove User Content at any time and for any
                        reason.</Typography>

                    <Typography variant="h6">3. Copyright Protection</Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>User is solely responsible for ensuring that
                        User
                        Content does not
                        infringe the intellectual property
                        rights of any third party. User agrees to indemnify and hold harmless Company from any and all
                        claims,
                        damages, and expenses (including reasonable attorneys' fees) arising out of or in connection
                        with
                        any
                        infringement or alleged infringement of third-party intellectual property rights.
                    </Typography>
                    <Typography variant="h6">4. Limitation of Liability</Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>Company shall not be liable for any direct,
                        indirect, incidental,
                        special, or consequential damages
                        arising out of or in connection with User's use of the Application or this Agreement, whether
                        based
                        on
                        breach of contract, tort (including negligence), or any other legal theory, even if Company has
                        been
                        advised of the possibility of such damages. User agrees to indemnify and hold harmless Company
                        from
                        any
                        and all claims, damages, and expenses (including reasonable attorneys' fees) arising out of or
                        in
                        connection with User's use of the Application.</Typography>

                    <Typography variant="h6">5. Governing Law and Jurisdiction</Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>This Agreement shall be governed by and
                        construed
                        in accordance with the
                        laws of Ukraine. Any dispute arising out of or in connection with this Agreement shall be
                        resolved by
                        arbitration in accordance with the rules of the American Arbitration Association, and judgment
                        upon
                        the
                        award rendered by the arbitrator(s) may be entered in any court having jurisdiction
                        thereof.</Typography>

                    <Typography variant="body1" sx={{textAlign: "left"}}>By using the Application, User acknowledges
                        that
                        User has read and
                        understands this Agreement and agrees
                        to be bound by its terms.
                    </Typography>
                    <Typography variant="body1" sx={{textAlign: "left"}}>If you have any questions or concerns about
                        this
                        Agreement, please
                        contact "SounDream Ukraine" by this form.</Typography>
                </div>
            </div>
            <Footer/>
        </>

    )
}