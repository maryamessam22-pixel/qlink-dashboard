import React, { useEffect, useState } from 'react';
import qlinkLogoMark from '../../assets/brand/qlink-logo-mark.png';
import './Preloader.css';

const Preloader = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
      setIsLoading(false);
      onFinish();
    }, 1000);
  }, [onFinish]);
}