import { Card } from '../../../shared/types';

export const checkCardPlayability = (card: Card, hand: Card[], leadSuit: string | null): boolean => {
    console.log('Checking playability:', { 
        card, 
        leadSuit, 
        hand: hand.map(c => ({ type: c.type, suit: c.suit, specialType: c.specialType })) 
    });
    
    if (!leadSuit) {
        console.log('No lead suit, any card playable');
        return true;
    }
    
    if (card.type === 'special') {
        console.log('Special card, always playable');
        return true;
    }

    if (card.suit === leadSuit) {
        console.log('Card matches lead suit, playable');
        return true;
    }

    const hasLeadSuit = hand.some(c => c.suit === leadSuit);
    console.log('Has lead suit in hand:', hasLeadSuit);
    
    if (hasLeadSuit) {
        console.log('Has lead suit, must play it');
        return false;
    }

    console.log('No lead suit in hand, can play anything');
    return true;
};
