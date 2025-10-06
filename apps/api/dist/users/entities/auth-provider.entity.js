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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProviderLink = exports.AuthProvider = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["SMS"] = "SMS";
    AuthProvider["EMAIL"] = "EMAIL";
    AuthProvider["GOOGLE"] = "GOOGLE";
    AuthProvider["FACEBOOK"] = "FACEBOOK";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
let AuthProviderLink = class AuthProviderLink {
};
exports.AuthProviderLink = AuthProviderLink;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuthProviderLink.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuthProviderLink.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AuthProvider }),
    __metadata("design:type", String)
], AuthProviderLink.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuthProviderLink.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuthProviderLink.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], AuthProviderLink.prototype, "linkedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.authProviders),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], AuthProviderLink.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuthProviderLink.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AuthProviderLink.prototype, "updatedAt", void 0);
exports.AuthProviderLink = AuthProviderLink = __decorate([
    (0, typeorm_1.Entity)('auth_providers')
], AuthProviderLink);
