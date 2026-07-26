'use client';

import React, { memo } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

// Chave pública de teste oficial da Cloudflare que sempre aprova (dev local)
const TEST_SITE_KEY = '1x00000000000000000000AA';

export const TurnstileWidget = memo(function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className = '',
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;

  return (
    <div className={`flex justify-center my-3 min-h-[65px] ${className}`}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'light',
          responseField: false,
        }}
      />
    </div>
  );
});
