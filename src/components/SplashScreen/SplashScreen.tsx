import React from "react";
import "./Splash.css"; // le fichier CSS que je te donne plus bas

export default function SplashScreen() {
  return (
    <div className="splash-container">
      <img
        src="/Logo_rond_loupe_remove.png"
        alt="Bookhunter Logo"
        className="splash-logo"
      />
    </div>
  );
}
