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
async function checkUserBalance() {
    const dataSource = new typeorm_1.DataSource(typeorm_config_1.typeOrmConfig);
    try {
        await dataSource.initialize();
        console.log('Database connected');
        const mobileNumber = '+918397070108';
        // Find user
        const userResult = await dataSource.query(`
      SELECT id, "mobileNumber", status FROM users WHERE "mobileNumber" = $1
    `, [mobileNumber]);
        if (userResult.length === 0) {
            console.log('User not found');
            process.exit(0);
        }
        const user = userResult[0];
        console.log('User found:', user);
        // Get coin balance
        const balanceResult = await dataSource.query(`
      SELECT balance, total_earned, total_redeemed 
      FROM coin_balances 
      WHERE "userId" = $1
    `, [user.id]);
        console.log('Balance:', balanceResult);
        // Get transactions
        const transactionsResult = await dataSource.query(`
      SELECT id, type, status, coins_earned, coins_redeemed, bill_amount, created_at
      FROM coin_transactions 
      WHERE "userId" = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [user.id]);
        console.log('Recent transactions:', transactionsResult);
        await dataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
checkUserBalance();
