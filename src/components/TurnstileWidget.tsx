'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

// Chave pública de teste da Cloudflare que SEMPRE PASSA (para ambiente de dev local)
const TEST_SITE_KEY = '1x00000000000000000000AA';

export const TurnstileWidget = memo(function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Manter referências atualizadas dos callbacks para evitar que a alteração de props reinicie o efeito
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              if (isMounted && onVerifyRef.current) {
                onVerifyRef.current(token);
              }
            },
            'error-callback': () => {
              if (isMounted && onErrorRef.current) {
                onErrorRef.current();
              }
            },
            'expired-callback': () => {
              if (isMounted && onExpireRef.current) {
                onExpireRef.current();
              }
            },
            theme: 'light',
          });
        } catch (e) {
          console.error('Erro ao renderizar o Turnstile:', e);
        }
      }
    };

    // Garantir que o script do Turnstile seja injetado apenas 1 única vez no DOM
    if (!window.turnstile) {
      const existingScript = document.getElementById('cf-turnstile-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'cf-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;

        window.onloadTurnstileCallback = () => {
          renderWidget();
        };

        document.head.appendChild(script);
      } else {
        const prevCallback = window.onloadTurnstileCallback;
        window.onloadTurnstileCallback = () => {
          if (prevCallback) prevCallback();
          renderWidget();
        };
      }
    } else {
      renderWidget();
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {}
      }
    };
  }, [siteKey]); // Depende APENAS da siteKey constante para nao desmontar no re-render de formulários

  return (
    <div className={`flex justify-center my-3 min-h-[65px] ${className}`}>
      <div ref={containerRef} />
    </div>
  );
});
