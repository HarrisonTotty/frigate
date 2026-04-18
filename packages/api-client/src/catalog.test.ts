import { describe, it, expect } from "vitest";
import { fetchModuleSlots } from "./catalog";

const mockSlotDetail = {
  id: "aux-support-system",
  name: "Aux Support System",
  has_varients: true,
  desc: "short",
  extended_desc: "long",
};

globalThis.fetch = async (url: RequestInfo | URL) => {
  let urlStr: string = "";
  if (typeof url === "string") {
    urlStr = url;
  } else if (
    typeof url === "object" &&
    url !== null &&
    url.constructor &&
    url.constructor.name === "URL"
  ) {
    urlStr = (url as URL).toString();
  } else if (typeof url === "object" && url !== null && "url" in url) {
    urlStr = (url as Request).url;
  }

  // Slot ID list endpoint
  if (urlStr === "/v1/catalog/module-slots") {
    return {
      ok: true,
      json: async () => ({ slots: ["aux-support-system"] }),
    } as Response;
  }

  // Slot detail endpoint
  if (urlStr.startsWith("/v1/catalog/module-slots/")) {
    return {
      ok: true,
      json: async () => mockSlotDetail,
    } as Response;
  }

  return { ok: false } as Response;
};

describe("catalog API client", () => {
  it("fetchModuleSlots returns normalized slots", async () => {
    const slots = await fetchModuleSlots();
    expect(slots).toEqual([
      {
        ...mockSlotDetail,
        groups: [],
        description: "short",
        extendedDescription: "long",
        hasVariants: true,
      },
    ]);
  });
});
