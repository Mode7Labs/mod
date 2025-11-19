import React from 'react';
import './IconButton.css';

interface IconButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  variant?: 'default' | 'danger' | 'success';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  active = false,
  onClick,
  title,
  variant = 'default'
}) => {
  return (
    <button
      className={`icon-button ${active ? 'icon-button-active' : ''} icon-button-${variant}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {icon}
    </button>
  );
};
