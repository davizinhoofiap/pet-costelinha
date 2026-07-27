'use client';

import React from 'react';
import Link from 'next/link';

interface LgpdConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  className?: string;
}

export function LgpdConsentCheckbox({
  checked,
  onChange,
  required = true,
  className = '',
}: LgpdConsentCheckboxProps) {
  return (
    <div className={`flex items-start gap-2.5 text-xs text-slate-600 ${className}`}>
      <input
        type="checkbox"
        id="lgpd-consent-checkbox"
        required={required}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 text-orange-600 bg-slate-50 border-slate-300 rounded focus:ring-orange-500 shrink-0 cursor-pointer"
      />
      <label htmlFor="lgpd-consent-checkbox" className="leading-snug cursor-pointer select-none">
        Li e aceito os{' '}
        <Link
          href="/termos-de-uso"
          target="_blank"
          className="text-orange-600 font-bold hover:underline"
        >
          Termos e Condições de Uso
        </Link>{' '}
        e a{' '}
        <Link
          href="/politica-de-privacidade"
          target="_blank"
          className="text-orange-600 font-bold hover:underline"
        >
          Política de Privacidade (LGPD)
        </Link>{' '}
        da Pet Costelinha.
      </label>
    </div>
  );
}
