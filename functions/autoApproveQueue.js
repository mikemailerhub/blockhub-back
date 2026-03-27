const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

const autoApproveQueue = new Queue('autoApprove', { connection });

module.exports = autoApproveQueue;
