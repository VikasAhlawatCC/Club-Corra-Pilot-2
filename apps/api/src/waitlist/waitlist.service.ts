import { Injectable, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WaitlistEntry } from './entities/waitlist-entry.entity'

export interface CreateWaitlistEntryDto {
  email: string
  source?: string
}

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepository: Repository<WaitlistEntry>,
  ) {}

  async createWaitlistEntry(createWaitlistEntryDto: CreateWaitlistEntryDto): Promise<WaitlistEntry> {
    const { email, source = 'webapp' } = createWaitlistEntryDto

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format')
    }

    // Check if email already exists
    const existingEntry = await this.waitlistRepository.findOne({
      where: { email: email.toLowerCase() }
    })

    if (existingEntry) {
      throw new ConflictException('Email already exists in waitlist')
    }

    // Create new waitlist entry
    const waitlistEntry = this.waitlistRepository.create({
      email: email.toLowerCase(),
      source,
      status: 'pending'
    })

    return this.waitlistRepository.save(waitlistEntry)
  }

  async getAllWaitlistEntries(page: number = 1, limit: number = 50): Promise<{
    data: WaitlistEntry[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const skip = (page - 1) * limit

    const [entries, total] = await this.waitlistRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })

    return {
      data: entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getWaitlistStats(): Promise<{
    totalEntries: number
    pendingEntries: number
    approvedEntries: number
    recentEntries: number
  }> {
    const [totalEntries, pendingEntries, approvedEntries, recentEntries] = await Promise.all([
      this.waitlistRepository.count(),
      this.waitlistRepository.count({ where: { status: 'pending' } }),
      this.waitlistRepository.count({ where: { status: 'approved' } }),
      this.waitlistRepository.count({
        where: {
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      })
    ])

    return {
      totalEntries,
      pendingEntries,
      approvedEntries,
      recentEntries,
    }
  }

  async updateWaitlistEntryStatus(id: string, status: string, adminNotes?: string): Promise<WaitlistEntry> {
    const entry = await this.waitlistRepository.findOne({ where: { id } })
    if (!entry) {
      throw new BadRequestException('Waitlist entry not found')
    }

    entry.status = status
    if (adminNotes) {
      entry.adminNotes = adminNotes
    }

    return this.waitlistRepository.save(entry)
  }
}
