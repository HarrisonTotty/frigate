import { HttpClient } from "./http";
import {
  ensureBoolean,
  ensureNumber,
  ensureQuaternion,
  ensureString,
  ensureVector3,
  isRecord
} from "./events";
import type {
  AnalyzeResult,
  Blueprint,
  BlueprintModule,
  CommunicationsMessage,
  DockingStatus,
  EnergyWeaponStatus,
  EngineeringStatus,
  HelmStatus,
  KineticWeaponStatus,
  MissileWeaponStatus,
  ModuleStatus,
  NavigationSolution,
  Player,
  ScanResult,
  ScienceContact,
  Ship,
  Station,
  Team,
  ThreatContact,
  UniverseSummary,
  AddModuleRequest,
  UpdateModuleVariantRequest
} from "./types";

function mapArray<T>(value: unknown, mapper: (item: unknown) => T | null | undefined): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const result: T[] = [];
  for (const item of value) {
    const mapped = mapper(item);
    if (mapped != null) {
      result.push(mapped);
    }
  }
  return result;
}

function mapPlayer(payload: unknown): Player {
  if (!isRecord(payload)) {
    throw new Error("Invalid player payload");
  }
  return {
    id: ensureString(payload.id),
    name: ensureString(payload.name),
    teamId: payload.team_id == null ? null : ensureString(payload.team_id)
  };
}

function mapPlayers(payload: unknown): Player[] {
  return mapArray(payload, mapPlayer);
}

function mapTeam(payload: unknown): Team {
  if (!isRecord(payload)) {
    throw new Error("Invalid team payload");
  }
  return {
    id: ensureString(payload.id),
    name: ensureString(payload.name),
    faction: ensureString(payload.faction),
    members: mapArray(payload.members, (value) => ensureString(value)),
    credits: typeof payload.credits === 'number' ? payload.credits : 0
  };
}

function mapTeams(payload: unknown): Team[] {
  return mapArray(payload, mapTeam);
}

function mapBlueprintModule(payload: unknown): BlueprintModule {
  if (!isRecord(payload)) {
    throw new Error("Invalid blueprint module payload");
  }
  return {
    moduleId: ensureString(payload.module_id),
    position: ensureVector3(payload.position),
    kind: payload.kind == null ? null : ensureString(payload.kind)
  };
}

function mapBlueprint(payload: unknown): Blueprint {
  if (!isRecord(payload)) {
    throw new Error("Invalid blueprint payload");
  }
  const rolesRecord: Record<string, string> = {};
  if (isRecord(payload.roles)) {
    Object.entries(payload.roles).forEach(([key, value]) => {
      rolesRecord[key] = ensureString(value);
    });
  }
  return {
    id: ensureString(payload.id),
    name: ensureString(payload.name),
    shipClass: ensureString(payload.ship_class ?? payload.shipClass ?? ""),
    faction: ensureString(payload.faction),
    teamId: ensureString(payload.team_id ?? payload.teamId ?? ""),
    roles: rolesRecord,
    modules: mapArray(payload.modules, mapBlueprintModule),
    readyPlayerIds: mapArray(payload.ready_players ?? payload.readyPlayerIds, (value) => ensureString(value))
  };
}

function mapBlueprints(payload: unknown): Blueprint[] {
  return mapArray(payload, mapBlueprint);
}

function mapShip(payload: unknown): Ship {
  if (!isRecord(payload)) {
    throw new Error("Invalid ship payload");
  }
  return {
    id: ensureString(payload.id),
    name: ensureString(payload.name),
    classId: ensureString(payload.class ?? payload.class_id ?? ""),
    faction: ensureString(payload.faction),
    teamId: ensureString(payload.team_id ?? payload.teamId ?? ""),
    position: ensureVector3(payload.position),
    velocity: ensureVector3(payload.velocity),
    rotation: ensureQuaternion(payload.rotation),
    hull: ensureNumber(payload.hull),
    maxHull: ensureNumber(payload.max_hull ?? payload.maxHull),
    shields: ensureNumber(payload.shields),
    maxShields: ensureNumber(payload.max_shields ?? payload.maxShields),
    power: ensureNumber(payload.power),
    maxPower: ensureNumber(payload.max_power ?? payload.maxPower),
    modules: mapArray(payload.modules, (modulePayload) => {
      if (!isRecord(modulePayload)) {
        return null;
      }
      return {
        id: ensureString(modulePayload.id),
        moduleId: ensureString(modulePayload.module_id ?? modulePayload.moduleId ?? ""),
        health: ensureNumber(modulePayload.health),
        status: ensureString(modulePayload.status) as Ship["modules"][number]["status"],
        powerAllocation: modulePayload.power_allocation == null ? undefined : ensureNumber(modulePayload.power_allocation),
        coolingAllocation:
          modulePayload.cooling_allocation == null ? undefined : ensureNumber(modulePayload.cooling_allocation),
        tags: mapArray(modulePayload.tags, (tag) => ensureString(tag))
      };
    })
  };
}

function mapShips(payload: unknown): Ship[] {
  return mapArray(payload, mapShip);
}

function mapStation(payload: unknown): Station {
  if (!isRecord(payload)) {
    throw new Error("Invalid station payload");
  }
  return {
    id: ensureString(payload.id),
    name: ensureString(payload.name),
    position: ensureVector3(payload.position),
    faction: ensureString(payload.faction),
    services: mapArray(payload.services, (service) => ensureString(service)),
    size: ensureString(payload.size) as Station["size"]
  };
}

function mapStations(payload: unknown): Station[] {
  return mapArray(payload, mapStation);
}

function mapHelmStatus(payload: unknown): HelmStatus {
  if (!isRecord(payload)) {
    throw new Error("Invalid helm status payload");
  }
  return {
    thrust: ensureNumber(payload.thrust),
    rotationRate: ensureVector3(payload.rotation_rate ?? payload.rotationRate),
    warpActive: ensureBoolean(payload.warp_active ?? payload.warpActive),
    dockingMode: ensureBoolean(payload.docking_mode ?? payload.dockingMode),
    effectiveWeight: ensureNumber(payload.effective_weight ?? payload.effectiveWeight)
  };
}

function mapEngineeringStatus(payload: unknown): EngineeringStatus {
  if (!isRecord(payload)) {
    throw new Error("Invalid engineering status payload");
  }
  return {
    hullIntegrity: ensureNumber(payload.hull_integrity ?? payload.hullIntegrity),
    shieldStrength: ensureNumber(payload.shield_strength ?? payload.shieldStrength),
    powerLevel: ensureNumber(payload.power_level ?? payload.powerLevel),
    heatLevel: ensureNumber(payload.heat_level ?? payload.heatLevel),
    damagedModules: mapArray(payload.damaged_modules ?? payload.damagedModules, (value) => ensureString(value)),
    statusEffects: mapArray(payload.status_effects ?? payload.statusEffects, (value) => ensureString(value))
  };
}

function mapModuleStatus(payload: unknown): ModuleStatus {
  if (!isRecord(payload)) {
    throw new Error("Invalid module status payload");
  }
  return {
    moduleId: ensureString(payload.module_id ?? payload.moduleId ?? ""),
    health: ensureNumber(payload.health),
    efficiency: ensureNumber(payload.efficiency),
    powerAllocation: ensureNumber(payload.power_allocation ?? payload.powerAllocation),
    coolingAllocation: ensureNumber(payload.cooling_allocation ?? payload.coolingAllocation),
    status: ensureString(payload.status) as ModuleStatus["status"]
  };
}

function mapModuleStatuses(payload: unknown): ModuleStatus[] {
  return mapArray(payload, mapModuleStatus);
}

function mapEnergyWeaponStatus(payload: unknown): EnergyWeaponStatus {
  if (!isRecord(payload)) {
    throw new Error("Invalid energy weapon status payload");
  }
  return {
    weapons: mapArray(payload.weapons, (weaponPayload) => {
      if (!isRecord(weaponPayload)) {
        return null;
      }
      return {
        id: ensureString(weaponPayload.id),
        type: ensureString(weaponPayload.type),
        power: ensureNumber(weaponPayload.power),
        heat: ensureNumber(weaponPayload.heat),
        ready: ensureBoolean(weaponPayload.ready),
        autoFire: ensureBoolean(weaponPayload.auto_fire ?? weaponPayload.autoFire),
        tags: mapArray(weaponPayload.tags, (tag) => ensureString(tag))
      };
    }),
    currentTarget: payload.current_target == null ? null : ensureString(payload.current_target)
  };
}

function mapKineticWeaponStatus(payload: unknown): KineticWeaponStatus {
  if (!isRecord(payload)) {
    throw new Error("Invalid kinetic weapon status payload");
  }
  return {
    weapons: mapArray(payload.weapons, (weaponPayload) => {
      if (!isRecord(weaponPayload)) {
        return null;
      }
      return {
        id: ensureString(weaponPayload.id),
        kind: ensureString(weaponPayload.kind),
        ammoType: weaponPayload.ammo_type == null ? null : ensureString(weaponPayload.ammo_type),
        ammoCount: weaponPayload.ammo_count == null ? null : ensureNumber(weaponPayload.ammo_count),
        ready: ensureBoolean(weaponPayload.ready),
        autoFire: ensureBoolean(weaponPayload.auto_fire ?? weaponPayload.autoFire)
      };
    }),
    currentTarget: payload.current_target == null ? null : ensureString(payload.current_target)
  };
}

function mapMissileWeaponStatus(payload: unknown): MissileWeaponStatus {
  if (!isRecord(payload)) {
    throw new Error("Invalid missile weapon status payload");
  }
  return {
    weapons: mapArray(payload.weapons, (weaponPayload) => {
      if (!isRecord(weaponPayload)) {
        return null;
      }
      return {
        id: ensureString(weaponPayload.id),
        ordnanceType: weaponPayload.ordnance_type == null ? null : ensureString(weaponPayload.ordnance_type),
        loaded: ensureBoolean(weaponPayload.loaded),
        ammoCount: weaponPayload.ammo_count == null ? null : ensureNumber(weaponPayload.ammo_count),
        ready: ensureBoolean(weaponPayload.ready),
        lockQuality: weaponPayload.lock_quality == null ? null : ensureNumber(weaponPayload.lock_quality),
        autoFire: ensureBoolean(weaponPayload.auto_fire ?? weaponPayload.autoFire)
      };
    }),
    currentTarget: payload.current_target == null ? null : ensureString(payload.current_target)
  };
}

function mapScienceContact(payload: unknown): ScienceContact {
  if (!isRecord(payload)) {
    throw new Error("Invalid contact payload");
  }
  return {
    id: ensureString(payload.id),
    type: ensureString(payload.type) as ScienceContact["type"],
    distance: ensureNumber(payload.distance),
    bearing: isRecord(payload.bearing)
      ? {
          azimuth: ensureNumber(payload.bearing.azimuth),
          elevation: ensureNumber(payload.bearing.elevation)
        }
      : { azimuth: 0, elevation: 0 },
    velocity: ensureVector3(payload.velocity)
  };
}

function mapThreatContact(payload: unknown): ThreatContact {
  if (!isRecord(payload)) {
    throw new Error("Invalid threat payload");
  }
  return {
    id: ensureString(payload.id),
    type: ensureString(payload.type) as ThreatContact["type"],
    distance: ensureNumber(payload.distance),
    etaSeconds: ensureNumber(payload.eta ?? payload.etaSeconds),
    status: ensureString(payload.status) as ThreatContact["status"]
  };
}

function mapNavigationSolution(payload: unknown): NavigationSolution {
  if (!isRecord(payload)) {
    throw new Error("Invalid navigation payload");
  }
  const interceptRaw = payload.intercept_course ?? payload.interceptCourse;
  const interceptCourse = isRecord(interceptRaw)
    ? {
        pitch: ensureNumber(interceptRaw.pitch),
        yaw: ensureNumber(interceptRaw.yaw)
      }
    : { pitch: 0, yaw: 0 };
  return {
    targetId: ensureString(payload.target_id ?? payload.targetId ?? ""),
    distance: ensureNumber(payload.distance),
    heading: ensureVector3(payload.heading),
    etaSeconds: ensureNumber(payload.eta ?? payload.etaSeconds),
    interceptCourse
  };
}

function mapScanResult(payload: unknown): ScanResult {
  if (!isRecord(payload)) {
    throw new Error("Invalid scan result payload");
  }
  return {
    targetId: ensureString(payload.target_id ?? payload.targetId ?? ""),
    classification: ensureString(payload.classification),
    hullIntegrity: ensureNumber(payload.hull_integrity ?? payload.hullIntegrity),
    shieldStrength: ensureNumber(payload.shield_strength ?? payload.shieldStrength),
    weaponSystems: mapArray(payload.weapon_systems ?? payload.weaponSystems, (value) => ensureString(value)),
    threatLevel: ensureString(payload.threat_level ?? payload.threatLevel) as ScanResult["threatLevel"]
  };
}

function mapAnalyzeResult(payload: unknown): AnalyzeResult {
  if (!isRecord(payload)) {
    throw new Error("Invalid analysis payload");
  }
  const details: Record<string, unknown> = {};
  if (isRecord(payload.details)) {
    Object.assign(details, payload.details);
  }
  return {
    targetId: ensureString(payload.target_id ?? payload.targetId ?? ""),
    analysisType: ensureString(payload.analysis_type ?? payload.analysisType),
    details
  };
}

function mapDockingStatus(payload: unknown): DockingStatus {
  if (!isRecord(payload)) {
    throw new Error("Invalid docking status payload");
  }
  return {
    stationId: ensureString(payload.station_id ?? payload.stationId ?? ""),
    shipId: ensureString(payload.ship_id ?? payload.shipId ?? ""),
    status: ensureString(payload.status) as DockingStatus["status"]
  };
}

function mapUniverseSummary(payload: unknown): UniverseSummary {
  if (!isRecord(payload)) {
    throw new Error("Invalid universe summary payload");
  }
  return {
    generatedAt: ensureString(payload.generated_at ?? payload.generatedAt ?? ""),
    starCount: ensureNumber(payload.star_count ?? payload.starCount),
    factionCount: ensureNumber(payload.faction_count ?? payload.factionCount)
  };
}

export interface CreatePlayerRequest {
  readonly name: string;
}

export interface CreateTeamRequest {
  readonly name: string;
  readonly faction: string;
}

export interface CreateBlueprintRequest {
  readonly name: string;
  readonly ship_class: string;
  readonly faction: string;
}

export interface JoinBlueprintRequest {
  readonly player_id: string;
}

export interface UpdateRolesRequest {
  readonly assignments: Record<string, string>;
}

export interface ModuleMutationRequest {
  readonly module_id: string;
  readonly position?: { readonly x: number; readonly y: number; readonly z: number };
  readonly kind?: string | null;
}

export interface PowerAllocationRequest {
  readonly weapons: number;
  readonly shields: number;
  readonly engines: number;
  readonly sensors?: number;
  readonly auxiliary?: number;
}

export interface CoolingAllocationRequest {
  readonly reactor: number;
  readonly weapons: number;
  readonly engines: number;
  readonly shields?: number;
}

export interface RepairRequest {
  readonly module_id: string;
  readonly crew_assigned: number;
}

export interface ScanRequest {
  readonly target_id: string;
  readonly scan_type: "quick" | "detailed" | "deep";
}

export interface AnalyzeRequest {
  readonly target_id: string;
  readonly analysis_type: string;
}

export class PlayersResource {
  public constructor(private readonly http: HttpClient) {}

  public list(): Promise<Player[]> {
    return this.http.get("/v1/players", mapPlayers);
  }

  public create(request: CreatePlayerRequest): Promise<Player> {
    return this.http.post("/v1/players", request, mapPlayer);
  }

  public get(playerId: string): Promise<Player> {
    return this.http.get(`/v1/players/${playerId}`, mapPlayer);
  }

  public delete(playerId: string): Promise<void> {
    return this.http.delete(`/v1/players/${playerId}`, () => undefined);
  }
}

export class TeamsResource {
  public constructor(private readonly http: HttpClient) {}

  public list(): Promise<Team[]> {
    return this.http.get("/v1/teams", mapTeams);
  }

  public create(request: CreateTeamRequest): Promise<Team> {
    return this.http.post("/v1/teams", request, mapTeam);
  }

  public get(teamId: string): Promise<Team> {
    return this.http.get(`/v1/teams/${teamId}`, mapTeam);
  }

  public addPlayer(teamId: string, playerId: string): Promise<void> {
    return this.http.patch(`/v1/teams/${teamId}`, { player_id: playerId }, () => undefined);
  }

  public removePlayer(teamId: string, playerId: string): Promise<void> {
    return this.http.delete(`/v1/teams/${teamId}/players/${playerId}`, () => undefined);
  }
}

export class BlueprintsResource {
  public constructor(private readonly http: HttpClient) {}

  public list(): Promise<Blueprint[]> {
    return this.http.get("/v1/blueprints", mapBlueprints);
  }

  public create(request: CreateBlueprintRequest): Promise<Blueprint> {
    return this.http.post("/v1/blueprints", request, mapBlueprint);
  }

  public get(blueprintId: string): Promise<Blueprint> {
    return this.http.get(`/v1/blueprints/${blueprintId}`, mapBlueprint);
  }

  public join(blueprintId: string, request: JoinBlueprintRequest): Promise<void> {
    return this.http.post(`/v1/blueprints/${blueprintId}/join`, request, () => undefined);
  }

  public updateRoles(blueprintId: string, request: UpdateRolesRequest): Promise<void> {
    return this.http.patch(`/v1/blueprints/${blueprintId}/roles`, request, () => undefined);
  }

  /**
   * Add a module slot to the blueprint (Phase 1.3)
   * @param blueprintId Blueprint ID
   * @param request AddModuleRequest
   */
  public addModule(blueprintId: string, request: AddModuleRequest): Promise<void> {
    return this.http.post(`/v1/blueprints/${blueprintId}/modules`, request, () => undefined);
  }

  /**
   * Update module variant selection (Phase 1.3)
   * @param blueprintId Blueprint ID
   * @param moduleInstanceId Module instance ID
   * @param request UpdateModuleVariantRequest
   */
  public updateModuleVariant(blueprintId: string, moduleInstanceId: string, request: UpdateModuleVariantRequest): Promise<void> {
    return this.http.patch(`/v1/blueprints/${blueprintId}/modules/${moduleInstanceId}`, request, () => undefined);
  }

  /**
   * Remove a module slot from the blueprint (Phase 1.3)
   * @param blueprintId Blueprint ID
   * @param moduleInstanceId Module instance ID
   */
  public removeModule(blueprintId: string, moduleInstanceId: string): Promise<void> {
    return this.http.delete(`/v1/blueprints/${blueprintId}/modules/${moduleInstanceId}`, () => undefined);
  }

  public markReady(blueprintId: string, playerId: string): Promise<void> {
    return this.http.post(`/v1/blueprints/${blueprintId}/ready`, { player_id: playerId }, () => undefined);
  }

  public unmarkReady(blueprintId: string, playerId: string): Promise<void> {
    return this.http.delete(`/v1/blueprints/${blueprintId}/ready/${playerId}`, () => undefined);
  }

  public validate(blueprintId: string): Promise<Record<string, unknown>> {
    return this.http.get(`/v1/blueprints/${blueprintId}/validate`);
  }
}

export class ShipsResource {
  public constructor(private readonly http: HttpClient) {}

  public list(): Promise<Ship[]> {
    return this.http.get("/v1/ships", mapShips);
  }

  public get(shipId: string): Promise<Ship> {
    return this.http.get(`/v1/ships/${shipId}`, mapShip);
  }

  public compile(blueprintId: string): Promise<Ship> {
    return this.http.post("/v1/ships/compile", { blueprint_id: blueprintId }, mapShip);
  }
}

export class StationsResource {
  public constructor(private readonly http: HttpClient) {}

  public list(): Promise<Station[]> {
    return this.http.get("/v1/stations", mapStations);
  }

  public get(stationId: string): Promise<Station> {
    return this.http.get(`/v1/stations/${stationId}`, mapStation);
  }

  public requestDocking(stationId: string, shipId: string): Promise<DockingStatus> {
    return this.http.post(`/v1/stations/${stationId}/dock`, { ship_id: shipId }, mapDockingStatus);
  }

  public getDockingStatus(stationId: string, shipId: string): Promise<DockingStatus> {
    return this.http.get(`/v1/stations/${stationId}/dock/${shipId}`, mapDockingStatus);
  }
}

export class HelmResource {
  public constructor(private readonly http: HttpClient) {}

  public status(shipId: string): Promise<HelmStatus> {
    return this.http.get(`/v1/ships/${shipId}/helm/status`, mapHelmStatus);
  }

  public setThrust(shipId: string, thrust: number): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/helm/thrust`, { thrust }, () => undefined);
  }

  public rotate(shipId: string, rotation: { pitch: number; yaw: number; roll: number }): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/helm/rotate`, rotation, () => undefined);
  }

  public stop(shipId: string): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/helm/stop`, undefined, () => undefined);
  }

  public warp(shipId: string, warpFactor: number, heading: { x: number; y: number; z: number }): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/helm/warp`, { warp_factor: warpFactor, heading }, () => undefined);
  }

  public jump(shipId: string, destination: { x: number; y: number; z: number }): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/helm/jump`, { destination }, () => undefined);
  }

  public dock(shipId: string, stationId: string): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/helm/dock`, { station_id: stationId }, () => undefined);
  }
}

export class EngineeringResource {
  public constructor(private readonly http: HttpClient) {}

  public status(shipId: string): Promise<EngineeringStatus> {
    return this.http.get(`/v1/ships/${shipId}/status`, mapEngineeringStatus);
  }

  public modulesStatus(shipId: string): Promise<ModuleStatus[]> {
    return this.http.get(`/v1/ships/${shipId}/modules/status`, mapModuleStatuses);
  }

  public allocatePower(shipId: string, request: PowerAllocationRequest): Promise<void> {
    return this.http.patch(`/v1/ships/${shipId}/power/allocate`, request, () => undefined);
  }

  public allocateCooling(shipId: string, request: CoolingAllocationRequest): Promise<void> {
    return this.http.patch(`/v1/ships/${shipId}/cooling/allocate`, request, () => undefined);
  }

  public repair(shipId: string, request: RepairRequest): Promise<Record<string, unknown>> {
    return this.http.post(`/v1/ships/${shipId}/repair`, request);
  }
}

export class EnergyWeaponsResource {
  public constructor(private readonly http: HttpClient) {}

  public status(shipId: string): Promise<EnergyWeaponStatus> {
    return this.http.get(`/v1/ships/${shipId}/energy-weapons/status`, mapEnergyWeaponStatus);
  }

  public setTarget(shipId: string, targetId: string): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/energy-weapons/target`, { target_id: targetId }, () => undefined);
  }

  public fire(shipId: string, weaponId: string): Promise<Record<string, unknown>> {
    return this.http.post(`/v1/ships/${shipId}/energy-weapons/fire`, { weapon_id: weaponId });
  }

  public toggleAuto(shipId: string, enabled: boolean): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/energy-weapons/auto`, { enabled }, () => undefined);
  }
}

export class KineticWeaponsResource {
  public constructor(private readonly http: HttpClient) {}

  public status(shipId: string): Promise<KineticWeaponStatus> {
    return this.http.get(`/v1/ships/${shipId}/kinetic-weapons/status`, mapKineticWeaponStatus);
  }

  public setTarget(shipId: string, targetId: string): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/kinetic-weapons/target`, { target_id: targetId }, () => undefined);
  }

  public configure(shipId: string, weaponId: string, payload: Record<string, unknown>): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/kinetic-weapons/${weaponId}/configure`, payload, () => undefined);
  }
}

export class MissileWeaponsResource {
  public constructor(private readonly http: HttpClient) {}

  public status(shipId: string): Promise<MissileWeaponStatus> {
    return this.http.get(`/v1/ships/${shipId}/missile-weapons/status`, mapMissileWeaponStatus);
  }

  public setTarget(shipId: string, targetId: string): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/missile-weapons/target`, { target_id: targetId }, () => undefined);
  }
}

export class ScienceResource {
  public constructor(private readonly http: HttpClient) {}

  public contacts(shipId: string): Promise<ScienceContact[]> {
    return this.http.get(`/v1/ships/${shipId}/contacts`, (payload) => mapArray(payload, mapScienceContact));
  }

  public threats(shipId: string): Promise<ThreatContact[]> {
    return this.http.get(`/v1/ships/${shipId}/threats`, (payload) => mapArray(payload, mapThreatContact));
  }

  public scan(shipId: string, request: ScanRequest): Promise<ScanResult> {
    return this.http.post(`/v1/ships/${shipId}/scan`, request, mapScanResult);
  }

  public navigation(shipId: string, targetId: string): Promise<NavigationSolution> {
    return this.http.get(`/v1/ships/${shipId}/navigation/${targetId}`, mapNavigationSolution);
  }

  public analyze(shipId: string, request: AnalyzeRequest): Promise<AnalyzeResult> {
    return this.http.post(`/v1/ships/${shipId}/analyze`, request, mapAnalyzeResult);
  }
}

export class CommunicationsResource {
  public constructor(private readonly http: HttpClient) {}

  public hail(shipId: string, message: CommunicationsMessage): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/hail`, {
      target_id: message.targetId,
      message: message.message,
      tone: message.tone
    }, () => undefined);
  }

  public respond(shipId: string, message: CommunicationsMessage): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/respond`, {
      target_id: message.targetId,
      message: message.message,
      tone: message.tone
    }, () => undefined);
  }

  public jam(shipId: string, targetId: string): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/jam`, { target_id: targetId }, () => undefined);
  }

  public requestDocking(shipId: string, stationId: string): Promise<DockingStatus> {
    return this.http.post(`/v1/ships/${shipId}/dock-request`, { station_id: stationId }, mapDockingStatus);
  }

  public undock(shipId: string): Promise<void> {
    return this.http.post(`/v1/ships/${shipId}/undock`, undefined, () => undefined);
  }
}

export class GenerationResource {
  public constructor(private readonly http: HttpClient) {}

  public universe(): Promise<UniverseSummary> {
    return this.http.get("/v1/generation/universe", mapUniverseSummary);
  }
}

export class RestClient {
  public readonly players: PlayersResource;
  public readonly teams: TeamsResource;
  public readonly blueprints: BlueprintsResource;
  public readonly ships: ShipsResource;
  public readonly stations: StationsResource;
  public readonly helm: HelmResource;
  public readonly engineering: EngineeringResource;
  public readonly energyWeapons: EnergyWeaponsResource;
  public readonly kineticWeapons: KineticWeaponsResource;
  public readonly missileWeapons: MissileWeaponsResource;
  public readonly science: ScienceResource;
  public readonly communications: CommunicationsResource;
  public readonly generation: GenerationResource;

  public constructor(http: HttpClient) {
    this.players = new PlayersResource(http);
    this.teams = new TeamsResource(http);
    this.blueprints = new BlueprintsResource(http);
    this.ships = new ShipsResource(http);
    this.stations = new StationsResource(http);
    this.helm = new HelmResource(http);
    this.engineering = new EngineeringResource(http);
    this.energyWeapons = new EnergyWeaponsResource(http);
    this.kineticWeapons = new KineticWeaponsResource(http);
    this.missileWeapons = new MissileWeaponsResource(http);
    this.science = new ScienceResource(http);
    this.communications = new CommunicationsResource(http);
    this.generation = new GenerationResource(http);
  }
}
