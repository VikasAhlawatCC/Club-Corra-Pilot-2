import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PartnerApplication } from '../partners/entities/partner-application.entity'
import { WaitlistEntry } from '../waitlist/entities/waitlist-entry.entity'

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/form-submissions')
export class FormSubmissionsController {
  constructor(
    @InjectRepository(PartnerApplication)
    private partnerApplicationRepository: Repository<PartnerApplication>,
    @InjectRepository(WaitlistEntry)
    private waitlistEntryRepository: Repository<WaitlistEntry>,
  ) {}

  @Get('partner-applications')
  async getPartnerApplications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.partnerApplicationRepository
      .createQueryBuilder('application')
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      data: applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('partner-applications/:id')
  async getPartnerApplication(@Param('id') id: string) {
    const application = await this.partnerApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new Error('Partner application not found');
    }

    return application;
  }

  @Put('partner-applications/:id/status')
  async updatePartnerApplicationStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const application = await this.partnerApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new Error('Partner application not found');
    }

    application.status = body.status;
    if (body.notes) {
      application.adminNotes = body.notes;
    }

    return this.partnerApplicationRepository.save(application);
  }

  @Get('waitlist-entries')
  async getWaitlistEntries(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.waitlistEntryRepository
      .createQueryBuilder('entry')
      .orderBy('entry.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.andWhere('entry.status = :status', { status });
    }

    const [entries, total] = await queryBuilder.getManyAndCount();

    return {
      data: entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('waitlist-entries/:id')
  async getWaitlistEntry(@Param('id') id: string) {
    const entry = await this.waitlistEntryRepository.findOne({
      where: { id },
    });

    if (!entry) {
      throw new Error('Waitlist entry not found');
    }

    return entry;
  }

  @Put('waitlist-entries/:id/status')
  async updateWaitlistEntryStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    const entry = await this.waitlistEntryRepository.findOne({
      where: { id },
    });

    if (!entry) {
      throw new Error('Waitlist entry not found');
    }

    entry.status = body.status;
    if (body.notes) {
      entry.adminNotes = body.notes;
    }

    return this.waitlistEntryRepository.save(entry);
  }

  @Get('stats')
  async getFormSubmissionStats() {
    const [
      totalPartnerApplications,
      pendingPartnerApplications,
      approvedPartnerApplications,
      rejectedPartnerApplications,
      totalWaitlistEntries,
      pendingWaitlistEntries,
      approvedWaitlistEntries,
    ] = await Promise.all([
      this.partnerApplicationRepository.count(),
      this.partnerApplicationRepository.count({ where: { status: 'pending' } }),
      this.partnerApplicationRepository.count({ where: { status: 'approved' } }),
      this.partnerApplicationRepository.count({ where: { status: 'rejected' } }),
      this.waitlistEntryRepository.count(),
      this.waitlistEntryRepository.count({ where: { status: 'pending' } }),
      this.waitlistEntryRepository.count({ where: { status: 'approved' } }),
    ]);

    return {
      partnerApplications: {
        total: totalPartnerApplications,
        pending: pendingPartnerApplications,
        approved: approvedPartnerApplications,
        rejected: rejectedPartnerApplications,
      },
      waitlistEntries: {
        total: totalWaitlistEntries,
        pending: pendingWaitlistEntries,
        approved: approvedWaitlistEntries,
      },
    };
  }
}


