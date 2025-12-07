// Share Button Component (HU17)
// Allows sharing content on social media

import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle, Linkedin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  ShareContent,
  isShareSupported,
  shareContent,
  copyToClipboard,
  shareOnTwitter,
  shareOnFacebook,
  shareOnWhatsApp,
  shareOnLinkedIn,
  shareOnTelegram,
} from '@/services/shareService';

interface ShareButtonProps {
  content: ShareContent;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ShareButton = ({ content, variant = 'ghost', size = 'icon', className = '' }: ShareButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const supportsNativeShare = isShareSupported();

  const handleNativeShare = async () => {
    const success = await shareContent(content);
    if (success) {
      toast({
        title: '¡Compartido!',
        description: 'El contenido se compartió exitosamente.',
      });
    }
  };

  const handleCopy = async () => {
    const textToCopy = `${content.text}\n${content.url || window.location.href}`;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      toast({
        title: '¡Copiado!',
        description: 'El texto se copió al portapapeles.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitter = () => {
    shareOnTwitter(content);
    toast({ title: 'Abriendo Twitter...' });
  };

  const handleFacebook = () => {
    shareOnFacebook(content);
    toast({ title: 'Abriendo Facebook...' });
  };

  const handleWhatsApp = () => {
    shareOnWhatsApp(content);
    toast({ title: 'Abriendo WhatsApp...' });
  };

  const handleLinkedIn = () => {
    shareOnLinkedIn(content);
    toast({ title: 'Abriendo LinkedIn...' });
  };

  const handleTelegram = () => {
    shareOnTelegram(content);
    toast({ title: 'Abriendo Telegram...' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4" />
          {size !== 'icon' && <span className="ml-2">Compartir</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportsNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleTwitter}>
          <Twitter className="w-4 h-4 mr-2 text-sky-500" />
          Twitter / X
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleFacebook}>
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleTelegram}>
          <Send className="w-4 h-4 mr-2 text-blue-400" />
          Telegram
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleLinkedIn}>
          <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copiado!' : 'Copiar enlace'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
