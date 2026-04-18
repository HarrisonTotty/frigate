/**
 * Mock API Utilities for Testing
 *
 * Provides mock HYPERION API responses for development and testing.
 * Use these utilities in Storybook stories and unit tests.
 */

/**
 * Mock player data
 */
export const mockPlayers = [
  {
    id: "player-001",
    name: "Commander Sarah Chen",
    callsign: "PHOENIX",
    created_at: "2025-11-07T10:00:00Z",
  },
  {
    id: "player-002",
    name: "Captain Marcus Blake",
    callsign: "VIPER",
    created_at: "2025-11-06T15:30:00Z",
  },
  {
    id: "player-003",
    name: "Lieutenant Yuki Tanaka",
    callsign: "GHOST",
    created_at: "2025-11-05T08:45:00Z",
  },
  {
    id: "player-004",
    name: "Engineer David Rodriguez",
    callsign: "WRENCH",
    created_at: "2025-11-04T12:20:00Z",
  },
];

/**
 * Mock faction data
 */
export const mockFactions = [
  {
    id: "terran",
    name: "Terran Federation",
    description: "United Earth government controlling inner solar system",
    color: "#3498db",
  },
  {
    id: "mars",
    name: "Mars Coalition",
    description: "Independent Martian colonies seeking autonomy",
    color: "#e74c3c",
  },
  {
    id: "belters",
    name: "Belt Alliance",
    description: "Asteroid belt miners and outer system traders",
    color: "#95a5a6",
  },
  {
    id: "europa",
    name: "Europa Compact",
    description: "Jovian moon alliance focused on research",
    color: "#9b59b6",
  },
];

/**
 * Mock team data
 */
export const mockTeams = [
  {
    id: "team-001",
    name: "Crimson Raiders",
    faction: "Terran Federation",
    members: [
      "player-001",
      "player-005",
      "player-008",
      "player-012",
      "player-015",
      "player-018",
      "player-022",
      "player-028",
    ],
    status: "recruiting" as const,
  },
  {
    id: "team-002",
    name: "Void Walkers",
    faction: "Belt Alliance",
    members: ["player-002", "player-009", "player-014", "player-019", "player-025"],
    status: "active" as const,
  },
  {
    id: "team-003",
    name: "Iron Legion",
    faction: "Mars Coalition",
    members: [
      "player-003",
      "player-006",
      "player-010",
      "player-013",
      "player-016",
      "player-020",
      "player-023",
      "player-026",
      "player-029",
      "player-031",
      "player-034",
      "player-037",
    ],
    status: "in-mission" as const,
  },
  {
    id: "team-004",
    name: "Europa Explorers",
    faction: "Europa Compact",
    members: ["player-004", "player-007", "player-011"],
    status: "recruiting" as const,
  },
];

/**
 * Mock ship class data
 */
export const mockShipClasses = [
  { id: "scout", name: "Scout", max_crew: 3, max_build_points: 250 },
  { id: "corvette", name: "Corvette", max_crew: 5, max_build_points: 400 },
  { id: "frigate", name: "Frigate", max_crew: 7, max_build_points: 500 },
  { id: "destroyer", name: "Destroyer", max_crew: 8, max_build_points: 600 },
  { id: "cruiser", name: "Cruiser", max_crew: 9, max_build_points: 750 },
  { id: "battleship", name: "Battleship", max_crew: 12, max_build_points: 1000 },
  { id: "carrier", name: "Carrier", max_crew: 15, max_build_points: 1200 },
];

/**
 * Mock blueprint data
 */
export const mockBlueprints = [
  {
    id: "blueprint-001",
    name: "Thunderstrike",
    ship_class: "destroyer",
    team_id: "team-001",
    modules: [
      { id: "mod-001", module_id: "fusion-core-mk2", slot: 0 },
      { id: "mod-002", module_id: "impulse-drive-standard", slot: 1 },
      { id: "mod-003", module_id: "railgun-mk1", slot: 2 },
    ],
    crew_assignments: [
      {
        role: "captain",
        player_id: "player-001",
        player_name: "Commander Sarah Chen",
        is_ready: true,
      },
      {
        role: "helm",
        player_id: "player-002",
        player_name: "Captain Marcus Blake",
        is_ready: false,
      },
      {
        role: "engineering",
        player_id: "player-004",
        player_name: "Engineer David Rodriguez",
        is_ready: true,
      },
    ],
    build_points_used: 340,
    max_build_points: 600,
    is_validated: false,
    status: "designing",
    created_at: "2025-11-07T14:00:00Z",
  },
  {
    id: "blueprint-002",
    name: "Swift Arrow",
    ship_class: "frigate",
    team_id: "team-001",
    modules: [
      { id: "mod-004", module_id: "fusion-core-mk1", slot: 0 },
      { id: "mod-005", module_id: "impulse-drive-advanced", slot: 1 },
      { id: "mod-006", module_id: "laser-cannon-mk2", slot: 2 },
      { id: "mod-007", module_id: "missile-launcher-mk1", slot: 3 },
    ],
    crew_assignments: [
      {
        role: "captain",
        player_id: "player-005",
        player_name: "Lt. Commander Elena Vasquez",
        is_ready: true,
      },
      { role: "helm", player_id: "player-008", player_name: "Pilot Jackson Wu", is_ready: true },
      {
        role: "engineering",
        player_id: "player-012",
        player_name: "Chief Engineer Thomas O'Brien",
        is_ready: true,
      },
      {
        role: "tactical",
        player_id: "player-015",
        player_name: "Tactical Officer Maya Patel",
        is_ready: true,
      },
      {
        role: "science",
        player_id: "player-018",
        player_name: "Science Officer Dr. Ahmed Hassan",
        is_ready: true,
      },
      {
        role: "comms",
        player_id: "player-022",
        player_name: "Comms Specialist Sofia Kowalski",
        is_ready: true,
      },
      {
        role: "energy_weapons",
        player_id: "player-028",
        player_name: "Weapons Officer Ivan Petrov",
        is_ready: true,
      },
    ],
    build_points_used: 500,
    max_build_points: 500,
    is_validated: true,
    status: "ready",
    created_at: "2025-11-06T10:00:00Z",
  },
];

/**
 * Mock module catalog
 */
export const mockModuleCatalog = [
  // Power Cores
  {
    id: "fusion-core-mk1",
    name: "Fusion Core Mk1",
    category: "power-cores",
    build_points: 80,
    description: "Standard fusion reactor providing reliable power output",
    specs: { power_output: "500MW", efficiency: "85%", heat_signature: "Medium" },
  },
  {
    id: "fusion-core-mk2",
    name: "Fusion Core Mk2",
    category: "power-cores",
    build_points: 120,
    description: "Advanced fusion reactor with improved efficiency",
    specs: { power_output: "800MW", efficiency: "92%", heat_signature: "Medium" },
  },
  {
    id: "antimatter-reactor",
    name: "Antimatter Reactor",
    category: "power-cores",
    build_points: 200,
    description: "Cutting-edge power generation with massive output",
    specs: { power_output: "1500MW", efficiency: "98%", heat_signature: "High" },
  },

  // Impulse Engines
  {
    id: "impulse-drive-standard",
    name: "Standard Impulse Drive",
    category: "impulse-engines",
    build_points: 60,
    description: "Basic sublight propulsion system",
    specs: { max_thrust: "50kN", fuel_efficiency: "70%", max_speed: "0.2c" },
  },
  {
    id: "impulse-drive-advanced",
    name: "Advanced Impulse Drive",
    category: "impulse-engines",
    build_points: 100,
    description: "High-performance sublight engines",
    specs: { max_thrust: "85kN", fuel_efficiency: "82%", max_speed: "0.35c" },
  },

  // Energy Weapons
  {
    id: "laser-cannon-mk1",
    name: "Laser Cannon Mk1",
    category: "energy-weapons",
    build_points: 70,
    description: "Basic directed energy weapon",
    specs: { damage: "500", rate_of_fire: "5/sec", range: "10km", power_draw: "80MW" },
  },
  {
    id: "laser-cannon-mk2",
    name: "Laser Cannon Mk2",
    category: "energy-weapons",
    build_points: 110,
    description: "Improved laser weapon with higher damage output",
    specs: { damage: "750", rate_of_fire: "6/sec", range: "12km", power_draw: "120MW" },
  },
  {
    id: "plasma-beam",
    name: "Plasma Beam",
    category: "energy-weapons",
    build_points: 150,
    description: "High-energy plasma weapon for maximum damage",
    specs: { damage: "1200", rate_of_fire: "3/sec", range: "15km", power_draw: "200MW" },
  },

  // Kinetic Weapons
  {
    id: "railgun-mk1",
    name: "Railgun Mk1",
    category: "kinetic-weapons",
    build_points: 100,
    description: "Electromagnetic projectile weapon",
    specs: { damage: "850", rate_of_fire: "2/sec", range: "15km", ammo_capacity: "500" },
  },
  {
    id: "mass-driver",
    name: "Mass Driver",
    category: "kinetic-weapons",
    build_points: 140,
    description: "Heavy kinetic weapon for armor penetration",
    specs: { damage: "1500", rate_of_fire: "1/sec", range: "20km", ammo_capacity: "200" },
  },

  // Missile Weapons
  {
    id: "missile-launcher-mk1",
    name: "Missile Launcher Mk1",
    category: "missile-weapons",
    build_points: 90,
    description: "Standard missile launch system",
    specs: { damage: "2000", rate_of_fire: "0.5/sec", range: "30km", ammo_capacity: "24" },
  },
  {
    id: "torpedo-launcher",
    name: "Torpedo Launcher",
    category: "missile-weapons",
    build_points: 130,
    description: "Heavy torpedo system for capital ships",
    specs: { damage: "4000", rate_of_fire: "0.25/sec", range: "50km", ammo_capacity: "12" },
  },

  // Countermeasures
  {
    id: "chaff-launcher",
    name: "Chaff Launcher",
    category: "countermeasures",
    build_points: 40,
    description: "Deploys radar-confusing chaff",
    specs: { charges: "50", reload_time: "2s", effectiveness: "70%" },
  },
  {
    id: "ecm-suite",
    name: "ECM Suite",
    category: "countermeasures",
    build_points: 80,
    description: "Electronic countermeasures system",
    specs: { range: "5km", power_draw: "50MW", effectiveness: "85%" },
  },

  // Comms Systems
  {
    id: "basic-comms",
    name: "Basic Communications",
    category: "comms-systems",
    build_points: 30,
    description: "Standard ship-to-ship communications",
    specs: { range: "100km", bandwidth: "10Mbps", encryption: "Standard" },
  },
  {
    id: "advanced-comms",
    name: "Advanced Communications",
    category: "comms-systems",
    build_points: 60,
    description: "Long-range encrypted communications",
    specs: { range: "500km", bandwidth: "100Mbps", encryption: "Military-grade" },
  },

  // Maneuvering Thrusters
  {
    id: "rcs-standard",
    name: "Standard RCS",
    category: "maneuvering-thrusters",
    build_points: 40,
    description: "Reaction control system for maneuvering",
    specs: { thrust: "5kN", response_time: "100ms", fuel_efficiency: "75%" },
  },
  {
    id: "rcs-advanced",
    name: "Advanced RCS",
    category: "maneuvering-thrusters",
    build_points: 70,
    description: "High-performance maneuvering thrusters",
    specs: { thrust: "10kN", response_time: "50ms", fuel_efficiency: "85%" },
  },
];

/**
 * Mock API response builder
 */
export function createMockAPIResponse<T>(data: T, delay: number = 0): Promise<Response> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data),
        headers: new Headers(),
        redirected: false,
        statusText: "OK",
        type: "basic",
        url: "",
        clone: function () {
          return this;
        },
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        formData: async () => new FormData(),
      } as Response);
    }, delay);
  });
}

/**
 * Mock API error response builder
 */
export function createMockErrorResponse(message: string, status: number = 400): Promise<Response> {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
    headers: new Headers(),
    redirected: false,
    statusText: "Error",
    type: "basic",
    url: "",
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response);
}

/**
 * Mock fetch implementation for testing
 */
export function createMockFetch(
  options: {
    delay?: number;
    failPlayers?: boolean;
    failTeams?: boolean;
    failBlueprints?: boolean;
  } = {}
) {
  const { delay = 0, failPlayers = false, failTeams = false, failBlueprints = false } = options;

  return async (url: string, init?: RequestInit): Promise<Response> => {
    console.log("Mock API call:", url, init);

    // Players endpoint
    if (url.includes("/v1/players") && init?.method !== "POST") {
      if (failPlayers) return createMockErrorResponse("Failed to load players", 500);
      return createMockAPIResponse({ players: mockPlayers }, delay);
    }

    if (url.includes("/v1/players") && init?.method === "POST") {
      const body = JSON.parse(init.body as string);
      const newPlayer = {
        id: `player-${Date.now()}`,
        name: body.name,
        callsign: body.callsign,
        created_at: new Date().toISOString(),
      };
      return createMockAPIResponse({ player: newPlayer }, delay);
    }

    // Teams endpoint
    if (url.includes("/v1/teams") && init?.method !== "POST") {
      if (failTeams) return createMockErrorResponse("Failed to load teams", 500);
      return createMockAPIResponse({ teams: mockTeams }, delay);
    }

    if (url.includes("/v1/teams") && init?.method === "POST") {
      const body = JSON.parse(init.body as string);
      const newTeam = {
        id: `team-${Date.now()}`,
        name: body.name,
        faction: mockFactions.find((f) => f.id === body.faction)?.name || "Unknown",
        members: body.player_id ? [body.player_id] : [],
        status: "recruiting" as const,
      };
      return createMockAPIResponse({ team: newTeam }, delay);
    }

    // Factions endpoint
    if (url.includes("/v1/factions")) {
      return createMockAPIResponse({ factions: mockFactions }, delay);
    }

    // Blueprints endpoint
    if (url.includes("/v1/blueprints") && !url.includes("/modules") && init?.method !== "POST") {
      if (failBlueprints) return createMockErrorResponse("Failed to load blueprints", 500);
      return createMockAPIResponse({ blueprints: mockBlueprints }, delay);
    }

    if (url.includes("/v1/blueprints/") && url.includes("/modules")) {
      return createMockAPIResponse({ blueprint: mockBlueprints[0] }, delay);
    }

    // Modules endpoint
    if (url.includes("/v1/modules")) {
      return createMockAPIResponse({ modules: mockModuleCatalog }, delay);
    }

    // Ship classes endpoint
    if (url.includes("/v1/ship-classes")) {
      return createMockAPIResponse({ ship_classes: mockShipClasses }, delay);
    }

    return createMockErrorResponse("Endpoint not found", 404);
  };
}
