import css from './Modal.module.css';
import { useEffect } from 'react';

export const Modal = ({ onClose, largeImage }) => {
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const hendleBackdropClick = e => {
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  return (
    <div className={css.overlay} onClick={hendleBackdropClick}>
      <div className={css.modal}>
        <img src={largeImage} alt="img" />
      </div>
    </div>
  );
};
