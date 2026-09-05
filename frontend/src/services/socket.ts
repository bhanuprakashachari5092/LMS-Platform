/**
 * socket.ts — Canonical re-export of the production-ready SocketService singleton.
 *
 * This file previously created a new raw io() connection on each call, which broke
 * the singleton pattern and caused duplicate connections. It now delegates entirely
 * to socketService.ts which manages the single shared connection.
 */
export { getLiveClassroomSocket, socketService } from './socketService';
export { socketService as default } from './socketService';
