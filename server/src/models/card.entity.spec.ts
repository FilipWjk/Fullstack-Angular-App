import { Card } from './card.entity';

describe('Card Entity', () => {
  it('should create a Card instance', () => {
    const card = new Card();
    expect(card).toBeInstanceOf(Card);
  });

  it('should have all required properties', () => {
    const card = new Card();

    // ! Check that all properties exist
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('title');
    expect(card).toHaveProperty('image');
    expect(card).toHaveProperty('rating');
    expect(card).toHaveProperty('description');
    expect(card).toHaveProperty('author');
    expect(card).toHaveProperty('createdAt');
    expect(card).toHaveProperty('updatedAt');
  });

  it('should accept valid data', () => {
    const card = new Card();
    card.id = 1;
    card.title = 'Test Card';
    card.image = 'test-image.jpg';
    card.rating = 4.5;
    card.description = 'Test description';
    card.author = 'Test Author';
    card.createdAt = new Date();
    card.updatedAt = new Date();

    expect(card.id).toBe(1);
    expect(card.title).toBe('Test Card');
    expect(card.image).toBe('test-image.jpg');
    expect(card.rating).toBe(4.5);
    expect(card.description).toBe('Test description');
    expect(card.author).toBe('Test Author');
    expect(card.createdAt).toBeInstanceOf(Date);
    expect(card.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle different rating values', () => {
    const card = new Card();

    // Test integer rating
    card.rating = 5;
    expect(card.rating).toBe(5);

    // Test float rating
    card.rating = 3.75;
    expect(card.rating).toBe(3.75);

    // Test zero rating
    card.rating = 0;
    expect(card.rating).toBe(0);
  });

  it('should handle various string lengths', () => {
    const card = new Card();

    // Short strings
    card.title = 'A';
    card.author = 'B';
    card.description = 'C';
    card.image = 'D';

    expect(card.title).toBe('A');
    expect(card.author).toBe('B');
    expect(card.description).toBe('C');
    expect(card.image).toBe('D');

    // Long strings
    card.title = 'A'.repeat(120);
    card.author = 'B'.repeat(120);
    card.description = 'C'.repeat(2000);
    card.image = 'D'.repeat(300);

    expect(card.title).toBe('A'.repeat(120));
    expect(card.author).toBe('B'.repeat(120));
    expect(card.description).toBe('C'.repeat(2000));
    expect(card.image).toBe('D'.repeat(300));
  });

  it('should maintain referential integrity for dates', () => {
    const card = new Card();
    const now = new Date();

    card.createdAt = now;
    card.updatedAt = now;

    expect(card.createdAt).toBe(now);
    expect(card.updatedAt).toBe(now);

    const later = new Date(now.getTime() + 1000);
    card.updatedAt = later;

    expect(card.createdAt).toBe(now);
    expect(card.updatedAt).toBe(later);
    expect(card.createdAt).not.toBe(card.updatedAt);
  });
});
