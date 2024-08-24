import React, { useState, useEffect } from "react";
import "./StatusBar.css";

const StatusBar = ({ data }) => {
  const [stop, setStop] = useState(0);
  const [running, setRunning] = useState(0);
  const [overspeed, setOverspeed] = useState(0);
  const [idle, setIdle] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [all, setAll] = useState(0);

  function calulateStatus() {
    let stop = 0;
    let idle = 0;
    let running = 0;
    let overspeed = 0;
    let inactive = 0;
    let all = 0;

    data.forEach((element) => {
      if (!element.ignition && element.speed < 1) {
        stop++;
      } else if (element.ignition && element.speed < 2) {
        idle++;
      } else if (element.ignition && element.speed > 2 && element.speed < 60) {
        running++;
      } else if (element.ignition && element.overspeed > 50) {
        overspeed++;
      } else {
        inactive++;
      }
      all++;
    });

    setStop(stop);
    setIdle(idle);
    setRunning(running);
    setOverspeed(overspeed);
    setInactive(inactive);
    setAll(all);
  }

  const [count, setcount] = useState(0);
  useEffect(() => {
    setInterval(() => {
      calulateStatus();
    }, 1000);
  }, []);

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
