"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const axios_1 = __importDefault(require("axios"));
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "";
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || "";
const BUNNY_BASE = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}`;
const isDev = !BUNNY_API_KEY || !BUNNY_LIBRARY_ID;
exports.VideoService = {
    async createBunnyVideo(title) {
        if (isDev) {
            const mockId = `mock-${Date.now()}`;
            return { videoId: mockId, uploadUrl: `https://mock.bunnycdn.com/upload/${mockId}` };
        }
        const { data } = await axios_1.default.post(`${BUNNY_BASE}/videos`, { title }, { headers: { AccessKey: BUNNY_API_KEY, "Content-Type": "application/json" } });
        return {
            videoId: data.guid,
            uploadUrl: `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${data.guid}`,
        };
    },
    async uploadVideoToBunny(uploadUrl, fileBuffer) {
        if (isDev) {
            console.log(`[VideoService DEV] Would upload to: ${uploadUrl}`);
            return;
        }
        await axios_1.default.put(uploadUrl, fileBuffer, {
            headers: { AccessKey: BUNNY_API_KEY, "Content-Type": "video/*" },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
    },
    async getBunnyVideoStatus(videoId) {
        if (isDev || videoId.startsWith("mock-")) {
            return {
                status: "ready",
                encodingProgress: 100,
                thumbnailUrl: "https://via.placeholder.com/640x360.png",
                streamUrl: exports.VideoService.getBunnyStreamUrl(videoId),
                duration: 600,
            };
        }
        const { data } = await axios_1.default.get(`${BUNNY_BASE}/videos/${videoId}`, {
            headers: { AccessKey: BUNNY_API_KEY },
        });
        return {
            status: data.status === 4 ? "ready" : "processing",
            encodingProgress: data.encodeProgress || 0,
            thumbnailUrl: data.thumbnailFileName
                ? `https://${process.env.BUNNY_PULL_ZONE}/${videoId}/${data.thumbnailFileName}`
                : "",
            streamUrl: exports.VideoService.getBunnyStreamUrl(videoId),
            duration: data.length || 0,
        };
    },
    async deleteBunnyVideo(videoId) {
        if (isDev || videoId.startsWith("mock-"))
            return;
        await axios_1.default.delete(`${BUNNY_BASE}/videos/${videoId}`, {
            headers: { AccessKey: BUNNY_API_KEY },
        });
    },
    getBunnyStreamUrl(videoId) {
        if (isDev || videoId.startsWith("mock-")) {
            return "https://www.w3schools.com/html/mov_bbb.mp4";
        }
        return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
    },
};
