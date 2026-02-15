import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal - A premium custom confirmation dialog
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} title - Title of the modal
 * @param {string} message - Description message
 * @param {function} onConfirm - Callback when user clicks confirm
 * @param {function} onCancel - Callback when user clicks cancel/close
 * @param {string} confirmText - Label for confirm button
 * @param {string} cancelText - Label for cancel button
 * @param {string} type - 'danger' | 'warning' | 'info'
 */
export const ConfirmModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger"
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: 'var(--accent-alert)',
        warning: 'var(--accent-warning)',
        info: 'var(--accent-primary)'
    };

    const iconColor = colors[type] || colors.danger;

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 11000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '1rem'
        }}>
            <div className="glass-card animate-scale-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '2.5rem',
                position: 'relative',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: `1px solid ${iconColor}44`
            }}>
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <X size={20} />
                </button>

                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `${iconColor}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: iconColor
                }}>
                    <AlertTriangle size={32} />
                </div>

                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: 'var(--text-primary)'
                }}>
                    {title}
                </h3>

                <p style={{
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '2.5rem'
                }}>
                    {message}
                </p>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        style={{ flex: 1, padding: '0.8rem' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn"
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            background: type === 'danger' ? 'var(--accent-alert)' : iconColor,
                            color: type === 'danger' || type === 'info' ? 'white' : 'black',
                            fontWeight: 600
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
