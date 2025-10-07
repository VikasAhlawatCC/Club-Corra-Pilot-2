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
exports.WaitlistService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const waitlist_entry_entity_1 = require("./entities/waitlist-entry.entity");
let WaitlistService = class WaitlistService {
    constructor(waitlistRepository) {
        this.waitlistRepository = waitlistRepository;
    }
    async createWaitlistEntry(createWaitlistEntryDto) {
        const { email, source = 'webapp' } = createWaitlistEntryDto;
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        // Check if email already exists
        const existingEntry = await this.waitlistRepository.findOne({
            where: { email: email.toLowerCase() }
        });
        if (existingEntry) {
            throw new common_1.ConflictException('Email already exists in waitlist');
        }
        // Create new waitlist entry
        const waitlistEntry = this.waitlistRepository.create({
            email: email.toLowerCase(),
            source,
            status: 'pending'
        });
        return this.waitlistRepository.save(waitlistEntry);
    }
    async getAllWaitlistEntries(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [entries, total] = await this.waitlistRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            data: entries,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getWaitlistStats() {
        const [totalEntries, pendingEntries, approvedEntries, recentEntries] = await Promise.all([
            this.waitlistRepository.count(),
            this.waitlistRepository.count({ where: { status: 'pending' } }),
            this.waitlistRepository.count({ where: { status: 'approved' } }),
            this.waitlistRepository.count({
                where: {
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            })
        ]);
        return {
            totalEntries,
            pendingEntries,
            approvedEntries,
            recentEntries,
        };
    }
    async updateWaitlistEntryStatus(id, status, adminNotes) {
        const entry = await this.waitlistRepository.findOne({ where: { id } });
        if (!entry) {
            throw new common_1.BadRequestException('Waitlist entry not found');
        }
        entry.status = status;
        if (adminNotes) {
            entry.adminNotes = adminNotes;
        }
        return this.waitlistRepository.save(entry);
    }
};
exports.WaitlistService = WaitlistService;
exports.WaitlistService = WaitlistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(waitlist_entry_entity_1.WaitlistEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WaitlistService);
