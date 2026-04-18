import { describe, it, expect, vi } from "vitest";
import { ModuleVariantSelector } from "./ModuleVariantSelector";
import React from "react";
import { render, screen } from "@testing-library/react";

const mockVariants = [
  {
    id: "aux-support-system-mk1",
    type: "aux-support-system",
    name: "Aux Support System Mk1",
    model: "AS-MK1",
    manufacturer: "Hyperion",
    desc: "Basic support variant.",
    lore: "First production run.",
    cost: 2,
    additional_hp: 5,
    additional_power_consumption: 1,
    additional_heat_generation: 1,
    additional_weight: 10,
    stats: { support: true },
  },
];

global.fetch = vi.fn(async (url) => {
  const urlStr = typeof url === "string" ? url : ((url as Request).url ?? "");
  const mkResp = (payload: unknown): Response =>
    ({
      ok: true,
      json: async () => payload,
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic",
      url: urlStr,
      clone: () => undefined,
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => "",
    }) as unknown as Response;
  // Matches GET /v1/catalog/modules/:slotId/:variantId
  const variantDetailMatch = urlStr.match(/\/catalog\/modules\/[^/]+\/([^/?]+)$/);
  if (variantDetailMatch) {
    const variantId = variantDetailMatch[1];
    const variant = mockVariants.find((v) => v.id === variantId) ?? mockVariants[0];
    return mkResp(variant);
  }
  // Matches GET /v1/catalog/modules/:slotId — list of variant ID strings
  if (urlStr.includes("modules")) {
    return mkResp({ variants: mockVariants.map((v) => v.id) });
  }
  if (urlStr.includes("blueprints")) {
    return {
      ok: true,
      json: async () => ({}),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: "OK",
      type: "basic",
      url: urlStr,
      clone: () => undefined,
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => "",
    } as unknown as Response;
  }
  return {
    ok: false,
    json: async () => ({}),
    headers: new Headers(),
    redirected: false,
    status: 404,
    statusText: "Not Found",
    type: "basic",
    url: urlStr,
    clone: () => undefined,
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => "",
  } as unknown as Response;
});

describe("ModuleVariantSelector", () => {
  it("renders variant cards and allows selection", async () => {
    render(
      <ModuleVariantSelector
        apiUrl="/api"
        blueprintId="bp-1"
        moduleInstanceId="mod-1"
        moduleSlot={{
          id: "aux-support-system",
          name: "Aux Support System",
          description: "Auxiliary support slot.",
          extended_desc: "Provides auxiliary support capabilities.",
          groups: ["Essential"],
          required: true,
          hasVariants: true,
          has_varients: true,
          base_cost: 5,
          max_slots: 2,
          base_hp: 10,
          base_power_consumption: 2,
          base_heat_generation: 1,
          base_weight: 100,
        }}
        currentVariantId={null}
        isOpen={true}
        onClose={vi.fn()}
        buildPointsUsed={0}
        maxBuildPoints={10}
      />
    );
    expect(await screen.findByText("Aux Support System Mk1")).toBeDefined();
    expect(screen.getByText("[SELECT VARIANT]")).toBeDefined();
  });
});
