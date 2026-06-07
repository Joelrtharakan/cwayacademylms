import axios from "axios";
import { AppError } from "../utils/errors";

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

const bunnyApi = axios.create({
  baseURL: `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}`,
  headers: {
    AccessKey: BUNNY_API_KEY,
    Accept: "application/json",
  },
});

export const VideoService = {
  /**
   * Initializes a video object in Bunny.net.
   * Returns the videoId to be used for uploading.
   */
  async createBunnyVideo(title: string): Promise<{ videoId: string; uploadUrl: string }> {
    if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
      console.warn("[VideoService] Bunny credentials missing. Using mock video creation.");
      const mockId = `mock-video-${Date.now()}`;
      return { videoId: mockId, uploadUrl: `mock-upload-url/${mockId}` };
    }

    try {
      const response = await bunnyApi.post("/videos", { title });
      const videoId = response.data.guid;
      // Note: Direct upload via API might be different based on the Bunny library endpoint
      return { 
        videoId, 
        uploadUrl: `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}` 
      };
    } catch (error) {
      console.error("[VideoService] Failed to create video:", error);
      throw new AppError("Failed to initialize video upload", 500);
    }
  },

  /**
   * Uploads the video file buffer directly to Bunny.net.
   */
  async uploadVideoToBunny(uploadUrl: string, fileBuffer: Buffer) {
    if (!BUNNY_API_KEY) {
      console.warn("[VideoService] Bunny credentials missing. Mocking upload.");
      return;
    }

    try {
      await axios.put(uploadUrl, fileBuffer, {
        headers: {
          AccessKey: BUNNY_API_KEY,
          "Content-Type": "application/octet-stream",
        },
      });
    } catch (error) {
      console.error("[VideoService] Failed to upload video:", error);
      throw new AppError("Failed to upload video data", 500);
    }
  },

  /**
   * Gets the encoding status and thumbnail of a video.
   */
  async getBunnyVideoStatus(videoId: string) {
    if (!BUNNY_API_KEY) {
      return {
        status: "Mock Finished",
        encodingProgress: 100,
        thumbnailUrl: `https://mock.cdn/thumbnail/${videoId}.jpg`,
        streamUrl: this.getBunnyStreamUrl(videoId),
        duration: 120, // 2 minutes mock
      };
    }

    try {
      const response = await bunnyApi.get(`/videos/${videoId}`);
      const data = response.data;
      
      return {
        status: data.status, // e.g., 0 = queued, 1 = processing, 2 = finished
        encodingProgress: data.encodeProgress,
        thumbnailUrl: `https://${process.env.BUNNY_CDN_HOSTNAME}/${videoId}/${data.thumbnailFileName}`,
        streamUrl: this.getBunnyStreamUrl(videoId),
        duration: data.length,
      };
    } catch (error) {
      console.error("[VideoService] Failed to get video status:", error);
      throw new AppError("Failed to check video status", 500);
    }
  },

  /**
   * Deletes a video from Bunny.net.
   */
  async deleteBunnyVideo(videoId: string) {
    if (!BUNNY_API_KEY) {
      console.warn("[VideoService] Mock deleting video", videoId);
      return;
    }

    try {
      await bunnyApi.delete(`/videos/${videoId}`);
    } catch (error) {
      console.error("[VideoService] Failed to delete video:", error);
      throw new AppError("Failed to delete video", 500);
    }
  },

  /**
   * Helper to generate the standard embed URL.
   */
  getBunnyStreamUrl(videoId: string): string {
    return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
  },
};
