import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ width = 180, height = "auto", className = "", style = {} }) => {
  return (
    <img 
      src={logoImg} 
      alt="IRISAI Logo"
      className={className}
      style={{ width, height, objectFit: 'contain', ...style }}
    />
  );
}

export default Logo;
