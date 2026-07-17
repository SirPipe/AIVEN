import { useEffect, useState } from 'react';

const KEYBOARD_HEIGHT_THRESHOLD = 150;

export function useMobileKeyboard(): boolean {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const viewport = window.visualViewport;

        if (!viewport) {
            return;
        }

        const updateKeyboardVisibility = () => {
            const hiddenViewportHeight = window.innerHeight - viewport.height;

            setIsKeyboardVisible(
                hiddenViewportHeight > KEYBOARD_HEIGHT_THRESHOLD,
            );
        };

        viewport.addEventListener('resize', updateKeyboardVisibility);
        viewport.addEventListener('scroll', updateKeyboardVisibility);
        updateKeyboardVisibility();

        return () => {
            viewport.removeEventListener('resize', updateKeyboardVisibility);
            viewport.removeEventListener('scroll', updateKeyboardVisibility);
        };
    }, []);

    return isKeyboardVisible;
}
