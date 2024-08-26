import React, { Suspense } from "react";
import { useTypewriter } from "react-simple-typewriter";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Paper } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Earth from "../../public/Earth";
import "./LoginLayout.css";
import logo from "../../public/logo.png";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh", // Full viewport height for the layout
    position: "relative", // Relative positioning for the container
  },
  paper: {
    display: "flex",
    flexDirection: "row",
    gap: "0",
    // alignItems: 'center',
    flex: 1,
    boxShadow: "-2px 0px 16px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
    position: "relative",
    // backgroundImage: `url("../../public/Demo.jpg")`,
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    // objectFit: 'cover',
    backgroundColor: "#fff",
  },
  form: {
    // maxWidth: theme.spacing(52),
    // padding: theme.spacing(5),
    width: "100% !important",
  },
  Model: {
    width: "45%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    // alignItems: 'center',
    backgroundColor: "#212121",
    justifyContent: "center",
  },
  heading: {
    zIndex: "999999999999",
    marginBottom: "3rem",
    marginTop: "0",
    marginLeft: "5rem",
  },
  top: {
    marginTop: "4rem",
    marginLeft: "5rem",
    marginBottom: "0",
    color: "#fff",
  },
  infoContent: {
    // marginLeft: "4rem",
    width: "55%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "250px",
    marginTop: "1rem",
  },
  layOut: {
    border: "1px solid gray",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    // justifyContent: "center",
    flexDirection: "column",
    height: "32rem",
    width: "28rem",
    gap: "8rem",
    boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px',
  },
}));

const LoginLayout = ({ children }) => {
  const [typeEffect] = useTypewriter({
    words: [
      "Real-Time Tracking and Precision Management.",
      "Seamless Access to Vehicle Monitoring and Safety.",
      "Enhanced Security and Operational Efficiency.",
      "Advanced Tracking at Your Fingertips.",
      "Performance, Security, and Efficiency.",
      "Future Insights and Real-Time Control.",
      "Comprehensive Tracking and Analysis.",
      "Safety and Operational Excellence.",
      "Real-Time Visibility and Strategic Management.",
      "Optimal Performance and Access.",
    ],
    loop: 0, // Set to 0 for infinite loop, or a specific number of loops
    typeSpeed: 50,
    deleteSpeed: 30,
    delaySpeed: 1500,
    cursor: true,
    cursorStyle: "|",
    color: "orange",
  });

  const classes = useStyles();

  return (
    <main className={classes.root}>
      <Paper className={classes.paper}>
        {/* <div className={classes.videoBackgroundContainer}>
        <video autoPlay loop muted className={classes.videoBackground}>
          <source src={`../../public/Space.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
        {/* </div> */}

        <div className={classes.Model}>
          <h1 className={classes.top}>Welcome to,</h1>
          <h1 className={classes.heading} style={{ color: "orange" }}>
            Credence Tracker.
          </h1>
          <Canvas className={classes.can} style={{
            height: "50%",
            width: "50%",
            marginLeft: "5rem",
          }}>
            <ambientLight />
            <OrbitControls enableZoom={false} />
            <Suspense fallback={false}>
              <Earth />
            </Suspense>
            <Environment preset="sunset" />
          </Canvas>

          <p style={{marginTop: '0', marginBottom: "0", marginLeft: "5rem", color: "#fff" }}>
            {`Take Control of your Fleet with `}
            <span style={{ color: "orange" }}>{typeEffect}</span>
          </p>
          <p
            style={{
              marginTop: "3px",
              marginLeft: "5rem",
              fontSize: "0.8rem",
              color: "rgb(148 140 140)",
            }}
          >
            <i>
              <b>Innovative Tracking Solutions </b>
              .We Belive in Perfection & Excellence, Do you ?
            </i>
          </p>
        </div>

        <div className={classes.infoContent}>
          <div className={classes.layOut}>
            <div className={classes.logo}>
              <img
                src={logo}
                alt=""
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <form className={classes.form}>{children}</form>
          </div>
        </div>
      </Paper>
    </main>
  );
};

export default LoginLayout;
