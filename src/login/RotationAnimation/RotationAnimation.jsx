import React from "react";
import "./RotationAnimation.css";

const RotationAnimation = () => {
    return (
      <>
      

      <div className="rotation-container">
        <img src="/loginSignup/Ellipse 313.png" style={{width:"100%"}} alt="" />
        <div className="center-image">
          {/* Central Image */}
          <img src="/loginSignup/Group 390.png"  alt="Center" />
        </div>
  
        <div className="rotating-images">
          <img src="/loginSignup/school-bus 2.png" className="rotate-item item1 bus" alt="Image1" />
          <img src="/loginSignup/bicycle_1056358 1.png" className="rotate-item item2 cycle" alt="Image2" />
          <img src="/loginSignup/delivery-truck_11741660 1.png" className="rotate-item item3 truck" alt="Image3" />
          <img src="/loginSignup/dog-track-app_2818005 1.png" className="rotate-item item4 dog" alt="Image4" />
          <img src="/loginSignup/gps_12843531 1.png" className="rotate-item item5 phone" alt="Image5" />
          <img src="/loginSignup/man_3944442 1.png" className="rotate-item item6 man" alt="Image6" />
        </div>
      </div>
      </>
    );
  };
  

export default RotationAnimation;
