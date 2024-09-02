import React, { useState, useEffect } from "react";
import "./StatusBar.css";

const StatusBar = ({ positions = {} }) => {
  // Defaulting to an empty object
  const [stop, setStop] = useState(0);
  const [running, setRunning] = useState(0);
  const [overspeed, setOverspeed] = useState(0);
  const [idle, setIdle] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [all, setAll] = useState(0);

  const calculateStatus = () => {
    const positionArray = Object.values(positions); // Convert positions object to an array of values

    let stopCount = 0;
    let idleCount = 0;
    let runningCount = 0;
    let overspeedCount = 0;
    let inactiveCount = 0;

    positionArray.forEach((position) => {
      if (!position.attributes.ignition && position.speed < 1) {
        stopCount++;
      } else if (position.attributes.ignition && position.speed < 2) {
        idleCount++;
      } else if (
        position.attributes.ignition &&
        position.speed >= 2 &&
        position.speed <= 60
      ) {
        runningCount++;
      } else if (position.attributes.ignition && position.speed > 60) {
        overspeedCount++;
      } else {
        inactiveCount++;
      }
    });

    setStop(stopCount);
    setIdle(idleCount);
    setRunning(runningCount);
    setOverspeed(overspeedCount);
    setInactive(inactiveCount);
    setAll(positionArray.length);
  };

  useEffect(() => {
    calculateStatus();
  }, [positions]);

  const statuses = [
    { count: all, label: "ALL", colorClass: "all" },
    { count: running, label: "RUNNING", colorClass: "running" },
    { count: stop, label: "STOPPED", colorClass: "stopped" },
    { count: overspeed, label: "OVERSPEED", colorClass: "overspeed" },
    { count: idle, label: "IDLE", colorClass: "idle" },
    { count: inactive, label: "INACTIVE", colorClass: "inactive" },
  ];

  return (
    <div className="status-bar">
      {statuses.map((status, index) => (
        <div key={index} className={`status-item ${status.colorClass}`}>
          <span className="count">{status.count}</span>
          <span className="label">{status.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatusBar;
