import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../models/card.entity';
import { CreateCardDto, UpdateCardDto } from '../models/card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
  ) {}

  async findAll(): Promise<Card[]> {
    return this.cardRepo.find();
  }

  async findOne(id: number): Promise<Card> {
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Invalid card ID');
    const card = await this.cardRepo.findOneBy({ id });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async create(data: CreateCardDto): Promise<Card> {
    const card = this.cardRepo.create({
      title: data.title,
      image: data.image,
      rating: data.rating ?? 0,
      description: data.description,
      author: data.author,
    });
    return this.cardRepo.save(card);
  }

  async update(id: number, data: UpdateCardDto): Promise<Card> {
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Invalid card ID');
    const existing = await this.cardRepo.findOneBy({ id });
    if (!existing) throw new NotFoundException('Card not found');
    await this.cardRepo.update(id, data as Partial<Card>);
    const updated = await this.cardRepo.findOneBy({ id });
    if (!updated) throw new NotFoundException('Card not found after update');
    return updated;
  }

  async delete(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Invalid card ID');
    const result = await this.cardRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Card not found');
  }
}
