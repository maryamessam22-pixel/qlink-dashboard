import React, { useEffect, useState } from 'react';
import qlinkLogoMark from '../../assets/brand/qlink-logo-mark.png';
import './Preloader.css';

const MEET_MS = 1100;
const SPIN_BEFORE_FADE_MS = 1200;

const Preloader = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState('meet');

  useEffect(() => {
    const t = setTimeout(() => setPhase('spin'), MEET_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fadeAt = MEET_MS + SPIN_BEFORE_FADE_MS;
    const timer1 = setTimeout(() => setIsVisible(false), fadeAt);
    const timer2 = setTimeout(() => {
      if (onFinish) onFinish();
    }, fadeAt + 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div className={`preloader-wrapper ${isVisible ? '' : 'fade-out'}`}>
      <div className="preloader-content">
        <div
          className={`qlink-logo-loader ${phase === 'spin' ? 'qlink-logo-loader--spinning' : ''}`}
          aria-hidden
        >
          <div className="qlink-logo-merge">
            <div className="qlink-logo-split qlink-logo-split--left">
              <img src={qlinkLogoMark} alt="" className="qlink-logo-img" draggable={false} />
            </div>
            <div className="qlink-logo-split qlink-logo-split--right">
              <img src={qlinkLogoMark} alt="" className="qlink-logo-img" draggable={false} />
            </div>
          </div>
        </div>

        <div className="loading-text">
          <span className="letter letter-1">Q</span>
          <span className="letter letter-2">L</span>
          <span className="letter letter-3">I</span>
          <span className="letter letter-4">N</span>
          <span className="letter letter-5">K</span>
        </div>

        <div className="loading-bar-container">
          <div className="loading-bar-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
