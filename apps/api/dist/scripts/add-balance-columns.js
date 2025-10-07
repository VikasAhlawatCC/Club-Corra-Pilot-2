"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const typeorm_1 = require("typeorm");
const typeorm_config_1 = require("../config/typeorm.config");
async function addBalanceColumns() {
    const dataSource = new typeorm_1.DataSource(typeorm_config_1.typeOrmConfig);
    try {
        await dataSource.initialize();
        console.log('Database connected');
        const queryRunner = dataSource.createQueryRunner();
        // Add total_earned and total_redeemed columns if they don't exist
        await queryRunner.query(`
      ALTER TABLE coin_balances 
      ADD COLUMN IF NOT EXISTS total_earned BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_redeemed BIGINT NOT NULL DEFAULT 0
    `);
        console.log('Successfully added total_earned and total_redeemed columns to coin_balances table');
        await queryRunner.release();
        await dataSource.destroy();
        console.log('Done!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error adding columns:', error);
        process.exit(1);
    }
}
addBalanceColumns();
