import React from "react";
import styles from "./Logo.module.css";

export const Logo1 = () =>{

    return (
        <div className={styles.logo}>
            <a href="/">
                <img alt={'logo'} src={'logo'}/>
            </a>
        </div>
    )
}
