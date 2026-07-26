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

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1082498234981-demo-petcostelinha.apps.googleusercontent.com';

  useEffect(() => {
    let isMounted = true;

    const handleCredentialResponse = async (response: any) => {
      if (!response || !response.credential) {
        if (onError) onError('Falha ao obter credenciais do Google.');
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
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          locale: 'pt-BR',
        });
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSDK;
      document.head.appendChild(script);
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
