import { GameState, Player, Card } from '../../../shared/types';
import { Deck } from './Deck';
import { v4 as uuidv4 } from 'uuid';

export class GameLogic {
  private deck: Deck;

  constructor() {
    this.deck = new Deck();
  }

  startGame(room: GameState) {
    room.phase = 'bidding';
    room.round = 1;
    this.startRound(room);
  }

  startRound(room: GameState) {
    this.deck.reset();
    room.tableCards = [];
    room.leadSuit = null;
    room.currentTurnIndex = (room.round - 1) % room.players.length; // Rotate starting player
    
    // Reset player round stats
    room.players.forEach(p => {
      p.hand = this.deck.deal(room.round);
      p.bid = -1; // Reset bid
      p.tricksWon = 0;
    });

    // Sort hands for better UX
    room.players.forEach(p => {
      this.sortHand(p.hand);
    });
  }

  private sortHand(hand: Card[]) {
    // Custom sort order: Escape -> Suits (Parrot, Map, Treasure) -> Trump (Jolly Roger) -> Special
    const suitOrder = { 'parrot': 1, 'map': 2, 'treasure': 3, 'jolly_roger': 4 };
    const specialOrder = { 'escape': 0, 'mermaid': 5, 'pirate': 6, 'tigress': 7, 'skull_king': 8 };

    hand.sort((a, b) => {
      const getOrder = (c: Card) => {
        if (c.type === 'special') return specialOrder[c.specialType!] || 99;
        return suitOrder[c.suit!] || 99;
      };

      const orderA = getOrder(a);
      const orderB = getOrder(b);

      if (orderA !== orderB) return orderA - orderB;
      return (a.value || 0) - (b.value || 0);
    });
  }

  submitBid(room: GameState, playerId: string, bid: number): boolean {
    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.bid = bid;

    // Check if all players have bid
    if (room.players.every(p => p.bid !== -1)) {
      room.phase = 'playing';
      // The first player is determined by round
      room.currentTurnIndex = (room.round - 1) % room.players.length;
    }

    return true;
  }

  playCard(room: GameState, playerId: string, cardId: string, playedAs?: 'escape' | 'pirate'): boolean {
    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    // Check if it's player's turn
    const currentPlayer = room.players[room.currentTurnIndex];
    if (currentPlayer.id !== playerId) return false;

    // Find card in hand
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;
    const card = player.hand[cardIndex];

    // Validate move
    if (!this.isValidMove(card, player.hand, room.leadSuit)) {
      return false;
    }

    // Handle Tigress
    if (card.specialType === 'tigress') {
        if (playedAs && (playedAs === 'escape' || playedAs === 'pirate')) {
            card.playedAs = playedAs;
        } else {
            // Default to Pirate if not specified (should be handled by frontend)
            card.playedAs = 'pirate'; 
        }
    }

    // Play card
    player.hand.splice(cardIndex, 1);
    room.tableCards.push({ playerId, card });

    // Set lead suit if this is the first card
    if (room.tableCards.length === 1) {
       // If first card is a numbered suit, set lead suit
       if (card.type === 'suit' && card.suit !== 'jolly_roger') {
           room.leadSuit = card.suit!;
       } else if (card.type === 'suit' && card.suit === 'jolly_roger') {
           // Jolly Roger is a Trump Suit. If led, players must follow Jolly Roger if possible.
           room.leadSuit = card.suit!;
       } else if (card.specialType === 'tigress' && card.playedAs === 'pirate') {
           // Tigress played as Pirate doesn't set lead suit (colorless)
           room.leadSuit = null;
       } else if (card.specialType === 'tigress' && card.playedAs === 'escape') {
           // Tigress played as Escape doesn't set lead suit
           room.leadSuit = null;
       } else {
           // Other special cards don't set lead suit usually
           room.leadSuit = null;
       }
    }

    // Advance turn
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;

    return true;
  }

  isValidMove(card: Card, hand: Card[], leadSuit: string | null): boolean {
    if (!leadSuit) return true; // No restriction if no lead suit (or special led)
    
    // Special cards (Escape, Pirate, Skull King, Mermaid, Tigress) can ALWAYS be played
    if (card.type === 'special') return true;

    // If card is same suit as lead, allowed
    if (card.suit === leadSuit) return true;

    // If player has lead suit in hand, MUST follow
    const hasLeadSuit = hand.some(c => c.suit === leadSuit);
    if (hasLeadSuit) {
        return false; // Must play lead suit
    }

    // If don't have lead suit, can play anything
    return true;
  }

  determineTrickWinner(room: GameState): string {
    // Determine winner without updating scores
    let winnerId = room.tableCards[0].playerId;
    let highestCard = room.tableCards[0].card;

    for (let i = 1; i < room.tableCards.length; i++) {
        const played = room.tableCards[i];
        if (this.isHigher(played.card, highestCard, room.leadSuit)) {
            highestCard = played.card;
            winnerId = played.playerId;
        }
    }
    
    return winnerId;
  }

  resolveTrickWithWinner(room: GameState, winnerId: string): void {
    // Update trick counts and set next leader using pre-determined winner
    const winner = room.players.find(p => p.id === winnerId);
    if (winner) {
        winner.tricksWon++;
    }

    // Set next leader
    const winnerIndex = room.players.findIndex(p => p.id === winnerId);
    room.currentTurnIndex = winnerIndex;
  }

  resolveTrick(room: GameState): string {
    // Original method for backward compatibility
    const winnerId = this.determineTrickWinner(room);
    this.resolveTrickWithWinner(room, winnerId);
    return winnerId;
  }

  private isHigher(challenger: Card, currentHigh: Card, leadSuit: string | null): boolean {
      const getSpecialPower = (c: Card) => {
          if (c.specialType === 'skull_king') return 100;
          if (c.specialType === 'pirate') return 90;
          if (c.specialType === 'mermaid') return 80;
          if (c.specialType === 'tigress') {
              if (c.playedAs === 'escape') return 0;
              return 89; // Default or 'pirate'
          }
          if (c.specialType === 'escape') return 0;
          return -1; // Not special
      };

      const valC = getSpecialPower(challenger);
      const valH = getSpecialPower(currentHigh);

      // 0. Handle Escape Cards (and Tigress as Escape)
      const isChallengerEscape = challenger.specialType === 'escape' || (challenger.specialType === 'tigress' && challenger.playedAs === 'escape');
      const isCurrentHighEscape = currentHigh.specialType === 'escape' || (currentHigh.specialType === 'tigress' && currentHigh.playedAs === 'escape');

      if (isCurrentHighEscape) {
          // If current high is Escape, ANY non-escape card beats it
          if (!isChallengerEscape) return true;
          return false; // Both are escape, first one wins
      }
      if (isChallengerEscape) {
          return false; // Challenger is escape, always loses to non-escape (and handled above if both escape)
      }

      // 1. Handle Special Interactions
      if (valC > 0 || valH > 0) {
          if (challenger.specialType === 'mermaid' && currentHigh.specialType === 'skull_king') return true; // Mermaid kills Skull King
          if (challenger.specialType === 'skull_king' && currentHigh.specialType === 'mermaid') return false; 
          
          if (challenger.specialType === 'skull_king' && currentHigh.specialType === 'pirate') return true;
          if (challenger.specialType === 'pirate' && currentHigh.specialType === 'skull_king') return false;

          if (challenger.specialType === 'pirate' && currentHigh.specialType === 'mermaid') return true;
          if (challenger.specialType === 'mermaid' && currentHigh.specialType === 'pirate') return false;

          if (valC === valH && valC > 0) return false; // Challenger (later) loses tie

          if (valC > valH) return true;
          if (valH > valC) return false;
      }
      
      // 2. Jolly Roger (Trump)
      if (challenger.suit === 'jolly_roger' && currentHigh.suit !== 'jolly_roger') {
          return true; 
      }
      if (currentHigh.suit === 'jolly_roger' && challenger.suit !== 'jolly_roger') {
          return false;
      }
      if (challenger.suit === 'jolly_roger' && currentHigh.suit === 'jolly_roger') {
          return (challenger.value || 0) > (currentHigh.value || 0);
      }

      // 3. Lead Suit
      if (challenger.suit === leadSuit) {
          if (currentHigh.suit !== leadSuit) return true;
          return (challenger.value || 0) > (currentHigh.value || 0);
      }

      return false; 
  }

  calculateScores(room: GameState) {
    room.players.forEach(player => {
        let roundScore = 0;
        const diff = Math.abs(player.bid - player.tricksWon);

        if (player.bid === 0) {
            // Zero Bid Logic
            if (player.tricksWon === 0) {
                // Success: round * 10
                roundScore = room.round * 10;
            } else {
                // Fail: - (round * 10)
                roundScore = -(room.round * 10);
            }
        } else {
            // Standard Bid Logic
            if (player.bid === player.tricksWon) {
                // Success: 20 per trick
                roundScore = player.tricksWon * 20;
                
                // TODO: Add Bonus points (Pirate, Skull King, Mermaid captures)
                // We need to track who captured what during tricks to add bonus points accurately.
                // For MVP, we skip detailed bonus points or assume simple scoring first.
            } else {
                // Fail: -10 per difference
                roundScore = -(diff * 10);
            }
        }
        
        player.score += roundScore;
    });
  }

  endRound(room: GameState): boolean {
    this.calculateScores(room);
    
    // Check if game ends
    if (room.round >= 10) {
        room.phase = 'ended';
        return true; // Game Over
    }

    // Start next round
    room.round++;
    room.phase = 'bidding';
    this.startRound(room);
    return false; // Continue
  }

  addBot(room: GameState) {
    const botId = `BOT-${uuidv4().slice(0, 4)}`;
    const botName = `Bot ${room.players.length + 1}`;
    const newPlayer: Player = {
      id: botId,
      name: botName,
      hand: [],
      bid: -1,
      tricksWon: 0,
      score: 0,
      isReady: true
    };
    room.players.push(newPlayer);
    return newPlayer;
  }
}
