export const webFullscreenOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1000,
    background: 'rgba(0,0,0,0.35)',
};

export const webFullscreenContainerStyle = {
    background: '#fff',
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    boxShadow: 'none',
    padding: 0,
    position: 'relative' as const,
    overflow: 'auto' as const,
};