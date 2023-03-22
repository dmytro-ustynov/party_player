import React from 'react'
import {useAuthState} from "../../components/auth/context";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Header from "../../components/Header/Header";
import HeaderLinks from "../../components/Header/HeaderLinks";
import Parallax from "../../components/Parallax/Parallax";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import styles from "../../assets/jss/material/views/homePage.js";
import image from '../../assets/img/bg7.jpg'

const useStyles = makeStyles(styles);


const HomePage = () => {
    const state = useAuthState()
    const classes = useStyles();
    const user = state.user
    console.log('image', image)

    const welcomeMessage = user.role === 'anonymous' ? 'Login or register ': `Welcome, ${user.username}`
    return (
        <>
            <Header
                // brand="some brand may be here"
                rightLinks={<HeaderLinks/>}
                fixed
                color="transparent"
                changeColorOnScroll={{
                  height: 400,
                  color: "white",
                }}
              />
            <Parallax image={image} >
            <div className={classes.container}>
          <GridContainer>
            <GridItem>
              <div className={classes.brand}>
                <h1 className={classes.title}>Party Player.</h1>
                <h3 className={classes.subtitle}>
                  Bring your sounds to life.
                </h3>
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
            <div className={''}>

                <div className={classes.inputContainer}>
                  <div style={{display: "grid", gridTemplateColumns: '1fr 1fr', gridColumnGap: '1em'}}>
                    <div className={classes.centeredContainer}>
                      {/*<DropInput />*/}
                    </div>
                    <div className={classes.centeredContainer}>
                      {/*<Microphone*/}

                    </div>
                  </div>

                </div>
                {/*<RecentFiles/>*/}

              </div>
        </>
    )
}

export default HomePage