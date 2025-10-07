"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormSubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../common/guards/admin.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const partner_application_entity_1 = require("../partners/entities/partner-application.entity");
const waitlist_entry_entity_1 = require("../waitlist/entities/waitlist-entry.entity");
let FormSubmissionsController = class FormSubmissionsController {
    constructor(partnerApplicationRepository, waitlistEntryRepository) {
        this.partnerApplicationRepository = partnerApplicationRepository;
        this.waitlistEntryRepository = waitlistEntryRepository;
    }
    async getPartnerApplications(page = 1, limit = 20, status) {
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
    async getPartnerApplication(id) {
        const application = await this.partnerApplicationRepository.findOne({
            where: { id },
        });
        if (!application) {
            throw new Error('Partner application not found');
        }
        return application;
    }
    async updatePartnerApplicationStatus(id, body) {
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
    async getWaitlistEntries(page = 1, limit = 20, status) {
        try {
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
        catch (error) {
            console.error('Error fetching waitlist entries:', error);
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
            };
        }
    }
    async getWaitlistEntry(id) {
        const entry = await this.waitlistEntryRepository.findOne({
            where: { id },
        });
        if (!entry) {
            throw new Error('Waitlist entry not found');
        }
        return entry;
    }
    async updateWaitlistEntryStatus(id, body) {
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
    async getFormSubmissionStats() {
        const [totalPartnerApplications, pendingPartnerApplications, approvedPartnerApplications, rejectedPartnerApplications, totalWaitlistEntries, pendingWaitlistEntries, approvedWaitlistEntries,] = await Promise.all([
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
};
exports.FormSubmissionsController = FormSubmissionsController;
__decorate([
    (0, common_1.Get)('partner-applications'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], FormSubmissionsController.prototype, "getPartnerApplications", null);
__decorate([
    (0, common_1.Get)('partner-applications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormSubmissionsController.prototype, "getPartnerApplication", null);
__decorate([
    (0, common_1.Put)('partner-applications/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FormSubmissionsController.prototype, "updatePartnerApplicationStatus", null);
__decorate([
    (0, common_1.Get)('waitlist-entries'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], FormSubmissionsController.prototype, "getWaitlistEntries", null);
__decorate([
    (0, common_1.Get)('waitlist-entries/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormSubmissionsController.prototype, "getWaitlistEntry", null);
__decorate([
    (0, common_1.Put)('waitlist-entries/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FormSubmissionsController.prototype, "updateWaitlistEntryStatus", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FormSubmissionsController.prototype, "getFormSubmissionStats", null);
exports.FormSubmissionsController = FormSubmissionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('admin/form-submissions'),
    __param(0, (0, typeorm_1.InjectRepository)(partner_application_entity_1.PartnerApplication)),
    __param(1, (0, typeorm_1.InjectRepository)(waitlist_entry_entity_1.WaitlistEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FormSubmissionsController);
