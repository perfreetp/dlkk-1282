import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className,
  label = '复制',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant={copied ? 'secondary' : 'ghost'}
      size="sm"
      leftIcon={copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
      onClick={handleCopy}
      className={className}
    >
      {copied ? '已复制' : label}
    </Button>
  );
};
