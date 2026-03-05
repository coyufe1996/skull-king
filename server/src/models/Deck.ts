import { Card } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.cards = [];

    // 1. Colored Suits (1-14 for Green, Purple, Yellow)
    const suits: ('parrot' | 'map' | 'treasure')[] = ['parrot', 'map', 'treasure'];
    suits.forEach(suit => {
      for (let i = 1; i <= 14; i++) {
        this.cards.push({
          id: uuidv4(),
          type: 'suit',
          suit: suit,
          value: i
        });
      }
    });

    // 2. Jolly Roger (Trump) (1-14)
    for (let i = 1; i <= 14; i++) {
      this.cards.push({
        id: uuidv4(),
        type: 'suit',
        suit: 'jolly_roger',
        value: i
      });
    }

    // 3. Special Cards
    // 5 Pirates
    for (let i = 0; i < 5; i++) {
      this.cards.push({ id: uuidv4(), type: 'special', specialType: 'pirate' });
    }

    // 1 Skull King
    this.cards.push({ id: uuidv4(), type: 'special', specialType: 'skull_king' });

    // 2 Mermaids
    for (let i = 0; i < 2; i++) {
      this.cards.push({ id: uuidv4(), type: 'special', specialType: 'mermaid' });
    }

    // 5 Escape (White Flag)
    for (let i = 0; i < 5; i++) {
      this.cards.push({ id: uuidv4(), type: 'special', specialType: 'escape' });
    }

    // 1 Tigress
    this.cards.push({ id: uuidv4(), type: 'special', specialType: 'tigress' });

    // Total should be 66 cards
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count: number): Card[] {
    return this.cards.splice(0, count);
  }

  reset() {
    this.initialize();
    this.shuffle();
  }
}
