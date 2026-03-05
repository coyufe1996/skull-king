import { GameState, Player, Card } from '../../../shared/types';

export class BotLogic {
  static makeBid(hand: Card[]): number {
    // Simple logic: 
    // +1 for each Pirate, Skull King, Mermaid
    // +1 for each Jolly Roger > 10
    // +1 for each suit card > 12
    let bid = 0;
    hand.forEach(card => {
      if (card.type === 'special') {
        if (['pirate', 'skull_king', 'mermaid'].includes(card.specialType || '')) {
          bid++;
        }
      } else if (card.suit === 'jolly_roger') {
         if ((card.value || 0) > 10) bid++;
      } else {
         if ((card.value || 0) > 12) bid++;
      }
    });
    return bid;
  }

  static playCard(room: GameState, bot: Player): Card | null {
    if (bot.hand.length === 0) return null;

    const leadSuit = room.leadSuit;
    const validCards = bot.hand.filter(card => this.isValidMove(card, bot.hand, leadSuit));
    
    // Random valid move for now
    if (validCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * validCards.length);
      return validCards[randomIndex];
    }
    
    // Fallback (shouldn't happen if logic is correct)
    return bot.hand[0];
  }

  private static isValidMove(card: Card, hand: Card[], leadSuit: string | null): boolean {
    if (!leadSuit) return true; // Can play anything if leading
    if (card.type === 'special') return true; // Special cards can usually be played anytime (simplification)
    
    // Must follow suit if possible
    const hasLeadSuit = hand.some(c => c.suit === leadSuit);
    if (hasLeadSuit) {
      return card.suit === leadSuit;
    }
    
    return true;
  }
}
