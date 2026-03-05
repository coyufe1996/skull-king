import React from 'react';
import { Card as CardType } from '../../../shared/types';
import { 
  Bird, 
  Map as MapIcon, 
  Coins, 
  Skull, 
  Flag, 
  Swords, 
  Crown, 
  Waves, 
  Cat,
  HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  card: CardType;
  className?: string;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ card, className, onClick, isPlayable = false, size = 'md' }) => {
  const getCardStyle = () => {
    switch (card.suit) {
      case 'parrot': return 'bg-green-100 border-green-600 text-green-800';
      case 'map': return 'bg-purple-100 border-purple-600 text-purple-800';
      case 'treasure': return 'bg-yellow-100 border-yellow-600 text-yellow-800';
      case 'jolly_roger': return 'bg-slate-900 border-slate-700 text-white';
      default: // Special cards
        if (card.specialType === 'escape') return 'bg-slate-200 border-slate-400 text-slate-600';
        if (card.specialType === 'pirate') return 'bg-red-100 border-red-600 text-red-800';
        if (card.specialType === 'skull_king') return 'bg-slate-900 border-yellow-500 text-yellow-500';
        if (card.specialType === 'mermaid') return 'bg-cyan-100 border-cyan-600 text-cyan-800';
        if (card.specialType === 'tigress') return 'bg-orange-100 border-orange-600 text-orange-800';
        return 'bg-white border-slate-300 text-slate-800';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 48 : 32;
    
    if (card.type === 'suit') {
        switch (card.suit) {
            case 'parrot': return <Bird size={iconSize} />;
            case 'map': return <MapIcon size={iconSize} />;
            case 'treasure': return <Coins size={iconSize} />;
            case 'jolly_roger': return <Skull size={iconSize} />;
        }
    } else if (card.type === 'special') {
        switch (card.specialType) {
            case 'escape': return <Flag size={iconSize} />;
            case 'pirate': return <Swords size={iconSize} />;
            case 'skull_king': return <div className="relative"><Skull size={iconSize} /><Crown size={iconSize/2} className="absolute -top-2 -right-2 text-yellow-500" /></div>;
            case 'mermaid': return <Waves size={iconSize} />;
            case 'tigress': return <Cat size={iconSize} />;
        }
    }
    return <HelpCircle size={iconSize} />;
  };

  const getLabel = () => {
    if (card.type === 'suit') return card.value.toString();
    switch (card.specialType) {
        case 'escape': return '撤退';
        case 'pirate': return '海盗';
        case 'skull_king': return '骷髅王';
        case 'mermaid': return '美人鱼';
        case 'tigress': return '母老虎';
        default: return '?';
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-24 text-xs',
    md: 'w-24 h-36 text-sm',
    lg: 'w-32 h-48 text-base'
  };

  return (
    <div 
      onClick={isPlayable ? onClick : undefined}
      className={twMerge(
        'relative rounded-xl border-2 flex flex-col items-center justify-center p-2 shadow-md transition-all duration-200 select-none',
        sizeClasses[size],
        getCardStyle(),
        isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl' : '',
        className
      )}
    >
      <div className="absolute top-2 left-2 font-bold opacity-50">{card.type === 'suit' ? card.value : ''}</div>
      <div className="flex-1 flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="font-bold text-center mt-1">
        {getLabel()}
      </div>
      {card.type === 'suit' && (
         <div className="absolute bottom-2 right-2 font-bold opacity-50 rotate-180">{card.value}</div>
      )}
    </div>
  );
};
