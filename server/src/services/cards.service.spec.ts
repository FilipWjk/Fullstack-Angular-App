import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardsService } from './cards.service';
import { Card } from '../models/card.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// * Unit tests for CardsService
// * These tests run fast and do not require a real database - the TypeORM
// * repository is mocked. They verify happy paths and error handling.
// ? Keep tests focused on service logic: repository behavior is simulated
// ? so tests remain deterministic and fast.
describe('CardsService', () => {
  let service: CardsService;
  let repo: Partial<Record<keyof Repository<Card>, jest.Mock>>;

  const mockCard: Card = {
    id: 1,
    title: 'Test card',
    image: 'img.png',
    rating: 4.5,
    description: 'desc',
    author: 'author',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Card;

  // * Test setup
  // ? We create a lightweight mock object for the TypeORM repository methods
  // ? that `CardsService` calls. Each test can override mock return values
  // ? to simulate different DB states (found, not found, affected=0, etc.).
  // ! Do not rely on repository implementation here; only stub the methods
  // ! that the service uses (find, findOneBy, create, save, update, delete).
  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([mockCard]),
      findOneBy: jest.fn().mockResolvedValue(mockCard),
      create: jest
        .fn()
        .mockImplementation((dto: Partial<Card>) => ({ ...dto }) as Card),
      save: jest.fn().mockResolvedValue(mockCard),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    } as Partial<Record<keyof Repository<Card>, jest.Mock>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: repo },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  // * Sanity: service should be created by the testing module
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // * Happy path: repository returns an array and service forwards it
  it('findAll returns array of cards', async () => {
    (repo.find as jest.Mock).mockResolvedValue([mockCard]);
    const result = await service.findAll();
    expect(result).toEqual([mockCard]);
    expect(repo.find).toHaveBeenCalled();
  });

  // * When a card exists, `findOne` returns it
  it('findOne returns a card when found', async () => {
    (repo.findOneBy as jest.Mock).mockResolvedValue(mockCard);
    const result = await service.findOne(1);
    expect(result).toEqual(mockCard);
  });

  // * Not found path: repository returns null -> service throws NotFoundException
  it('findOne throws NotFoundException when not found', async () => {
    (repo.findOneBy as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  // ! Invalid input validation: service should reject NaN/0/negative ids
  it('findOne throws BadRequestException for invalid id', async () => {
    await expect(service.findOne(Number.NaN)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.findOne(0)).rejects.toThrow(BadRequestException);
    await expect(service.findOne(-5)).rejects.toThrow(BadRequestException);
  });

  // * Creating a card: service should call repository.create/save and return the result
  it('create saves and returns the created card', async () => {
    const dto = {
      title: 'New',
      image: 'img2.png',
      rating: 3,
      description: 'd',
      author: 'a',
    };
    (repo.create as jest.Mock).mockReturnValue(dto);
    (repo.save as jest.Mock).mockResolvedValue({ ...mockCard, ...dto });

    const created = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith({
      title: dto.title,
      image: dto.image,
      rating: dto.rating ?? 0,
      description: dto.description,
      author: dto.author,
    });
    expect(created.title).toBe('New');
  });

  // * Update: service checks existence, calls update, and returns refreshed entity
  it('update updates and returns the updated card', async () => {
    (repo.findOneBy as jest.Mock).mockResolvedValueOnce(mockCard);
    const updatedRow = { ...mockCard, title: 'Updated' } as Card;
    (repo.findOneBy as jest.Mock).mockResolvedValueOnce(updatedRow);
    const dto = { title: 'Updated' };
    await service.update(1, dto);
    expect(repo.update).toHaveBeenCalledWith(1, { title: 'Updated' });
  });

  // ! Invalid id values should be rejected before repository is called
  it('update throws BadRequestException for invalid id', async () => {
    await expect(service.update(Number.NaN, { title: 'x' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.update(0, { title: 'x' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.update(-2, { title: 'x' })).rejects.toThrow(
      BadRequestException,
    );
  });

  // * Delete: when repository reports no rows affected, service should throw NotFound
  it('delete throws NotFoundException when nothing deleted', async () => {
    (repo.delete as jest.Mock).mockResolvedValueOnce({ affected: 0 });
    await expect(service.delete(1)).rejects.toThrow(NotFoundException);
  });

  it('delete throws BadRequestException for invalid id', async () => {
    await expect(service.delete(Number.NaN)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.delete(0)).rejects.toThrow(BadRequestException);
    await expect(service.delete(-3)).rejects.toThrow(BadRequestException);
  });

  // * Successful delete should resolve without error
  it('delete succeeds when affected > 0', async () => {
    (repo.delete as jest.Mock).mockResolvedValueOnce({ affected: 1 });
    await expect(service.delete(1)).resolves.toBeUndefined();
  });
});
