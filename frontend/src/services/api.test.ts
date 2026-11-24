import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAgencies, getHistory, getSummary, triggerIngest } from "./api";

// Mock fetch globally
global.fetch = vi.fn();

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAgencies", () => {
    it("fetches agencies successfully", async () => {
      const mockData = [{ agencyName: "DOJ", wordCount: 1000000 }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getAgencies();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/agencies")
      );
    });

    it("throws error on failed request", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(getAgencies()).rejects.toThrow("500 Internal Server Error");
    });
  });

  describe("getHistory", () => {
    it("fetches history successfully", async () => {
      const mockData = [{ period: "2024-01", amendmentCount: 45 }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getHistory();
      expect(result).toEqual(mockData);
    });
  });

  describe("getSummary", () => {
    it("fetches summary successfully", async () => {
      const mockData = {
        lastUpdated: "2024-03-15",
        titlesDownloaded: 48,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getSummary();
      expect(result).toEqual(mockData);
    });
  });

  describe("triggerIngest", () => {
    it("triggers ingestion successfully", async () => {
      const mockData = { message: "Ingestion started" };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await triggerIngest();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/ingest"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });
});
