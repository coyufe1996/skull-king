import { Card } from '../../../shared/types';

export const checkCardPlayability = (card: Card, hand: Card[], leadSuit: string | null): boolean => {
    // If no lead suit, any card is playable
    if (!leadSuit) return true;
    
    // Special cards can always be played
    if (card.type === 'special') return true;

    // If card matches lead suit, it's playable
    if (card.suit === leadSuit) return true;

    // If player has lead suit in hand, they must play it
    // Check if the player has any card of the lead suit in their hand
    const hasLeadSuit = hand.some(c => c.suit === leadSuit);
    if (hasLeadSuit) {
        // If they do, they cannot play a non-matching suit card
        return false;
    }

    // If player doesn't have lead suit, any card is playable
    return true;
};
