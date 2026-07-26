'use client';

import React, { useEffect, useRef } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (response: { credential?: string; user?: any }) => void;
  onError?: (errMessage: string) => void;
  turnstileToken?: string;
  className?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleLoginButton({ onSuccess, onError, turnstileToken, className = '' }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1090723739206-85rcju3kl60ghp9t13ehqi9be9j4p2i9.apps.googleusercontent.com';

  useEffect(() => {
    let isMounted = true;

    const handleCredentialResponse = async (response: any) => {
      if (!response || !response.credential) {
        if (onError) onError('Autenticação cancelada ou credenciais do Google não obtidas.');
        return;
      }

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: response.credential,
            turnstileToken,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao autenticar com o Google.');
        }

        if (isMounted) {
          onSuccess(data);
        }
      } catch (err: any) {
        if (isMounted && onError) {
          onError(err.message || 'Erro ao realizar login via Google.');
        }
      }
    };

    const initializeGoogleSDK = () => {
      if (window.google && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            locale: 'pt-BR',
          });
        } catch (err) {
          console.error('Erro ao inicializar o Google SDK:', err);
        }
      }
    };

    if (!window.google) {
      const existingScript = document.getElementById('google-gsi-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSDK;
        document.head.appendChild(script);
      } else {
        initializeGoogleSDK();
      }
    } else {
      initializeGoogleSDK();
    }
  }, [googleClientId, onSuccess, onError, turnstileToken]);

  return (
    <div className={`w-full ${className}`}>
      <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
    </div>
  );
}
