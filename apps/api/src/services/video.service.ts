import axios from "axios";

const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "";
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || "";
const BUNNY_BASE = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}`;

const isDev = !BUNNY_API_KEY || !BUNNY_LIBRARY_ID;

export const VideoService = {
  async createBunnyVideo(title: string): Promise<{ videoId: string; uploadUrl: string }> {
    if (isDev) {
      const mockId = `mock-${Date.now()}`;
      return { videoId: mockId, uploadUrl: `https://mock.bunnycdn.com/upload/${mockId}` };
    }
    const { data } = await axios.post(
      `${BUNNY_BASE}/videos`,
      { title },
      { headers: { AccessKey: BUNNY_API_KEY, "Content-Type": "application/json" } }
    );
    return {
      videoId: data.guid,
      uploadUrl: `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${data.guid}`,
    };
  },

  async uploadVideoToBunny(uploadUrl: string, fileBuffer: Buffer): Promise<void> {
    if (isDev) {
      console.log(`[VideoService DEV] Would upload to: ${uploadUrl}`);
      return;
    }
    await axios.put(uploadUrl, fileBuffer, {
      headers: { AccessKey: BUNNY_API_KEY, "Content-Type": "video/*" },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  },

  async getBunnyVideoStatus(videoId: string): Promise<{
    status: string;
    encodingProgress: number;
    thumbnailUrl: string;
    streamUrl: string;
    duration: number;
  }> {
    if (isDev || videoId.startsWith("mock-")) {
      return {
        status: "ready",
        encodingProgress: 100,
        thumbnailUrl: "https://via.placeholder.com/640x360.png",
        streamUrl: VideoService.getBunnyStreamUrl(videoId),
        duration: 600,
      };
    }
    const { data } = await axios.get(`${BUNNY_BASE}/videos/${videoId}`, {
      headers: { AccessKey: BUNNY_API_KEY },
    });
    return {
      status: data.status === 4 ? "ready" : "processing",
      encodingProgress: data.encodeProgress || 0,
      thumbnailUrl: data.thumbnailFileName
        ? `https://${process.env.BUNNY_PULL_ZONE}/${videoId}/${data.thumbnailFileName}`
        : "",
      streamUrl: VideoService.getBunnyStreamUrl(videoId),
      duration: data.length || 0,
    };
  },

  async deleteBunnyVideo(videoId: string): Promise<void> {
    if (isDev || videoId.startsWith("mock-")) return;
    await axios.delete(`${BUNNY_BASE}/videos/${videoId}`, {
      headers: { AccessKey: BUNNY_API_KEY },
    });
  },

  getBunnyStreamUrl(videoId: string): string {
    if (isDev || videoId.startsWith("mock-")) {
      return "https://www.w3schools.com/html/mov_bbb.mp4";
    }
    return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
  },
};
