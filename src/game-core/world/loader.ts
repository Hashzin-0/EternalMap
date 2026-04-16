import { WorldData } from './generation/world';
import { WorldGenerator, WorldConfig } from './generation/world';
import { Country, CountryType, GovernmentType } from '../types/world';

export interface LoaderResult {
  world: WorldData;
  countries: Map<string, Country>;
  loadedAt: number;
}

export class WorldLoader {
  private generator: WorldGenerator;
  private countries: Map<string, Country>;
  private loadedAt: number | null = null;
  
  constructor() {
    this.generator = new WorldGenerator({
      width: 80,
      height: 50,
      provinceCount: 150,
      seed: Date.now(),
    });
    this.countries = new Map();
  }
  
  generateWorld(config?: Partial<WorldConfig>): WorldData {
    if (config) {
      this.generator = new WorldGenerator(config);
    }
    const world = this.generator.generate();
    this.loadedAt = Date.now();
    return world;
  }
  
  loadDefaultCountries(): Map<string, Country> {
    const defaultCountries: Country[] = [
      {
        id: 'gbr',
        tag: 'GBR',
        nameKey: 'country.gbr',
        color: [0, 0, 255],
        countryType: 'playable' as CountryType,
        government: 'monarchy' as GovernmentType,
        primaryCulture: 'british',
        religion: 'anglican',
        capitalStateId: null,
        ownedStates: [],
        marketId: 'london',
        treasury: 1000000,
        prestige: 100,
      },
      {
        id: 'fra',
        tag: 'FRA',
        nameKey: 'country.fra',
        color: [0, 85, 255],
        countryType: 'playable' as CountryType,
        government: 'monarchy' as GovernmentType,
        primaryCulture: 'french',
        religion: 'catholic',
        capitalStateId: null,
        ownedStates: [],
        marketId: 'paris',
        treasury: 800000,
        prestige: 90,
      },
      {
        id: 'prs',
        tag: 'PRS',
        nameKey: 'country.prs',
        color: [0, 0, 0],
        countryType: 'playable' as CountryType,
        government: 'monarchy' as GovernmentType,
        primaryCulture: 'german',
        religion: 'protestant',
        capitalStateId: null,
        ownedStates: [],
        marketId: 'berlin',
        treasury: 600000,
        prestige: 80,
      },
      {
        id: 'rus',
        tag: 'RUS',
        nameKey: 'country.rus',
        color: [0, 128, 0],
        countryType: 'playable' as CountryType,
        government: 'monarchy' as GovernmentType,
        primaryCulture: 'russian',
        religion: 'orthodox',
        capitalStateId: null,
        ownedStates: [],
        marketId: 'moscow',
        treasury: 500000,
        prestige: 70,
      },
      {
        id: 'aus',
        tag: 'AUS',
        nameKey: 'country.aus',
        color: [255, 215, 0],
        countryType: 'playable' as CountryType,
        government: 'monarchy' as GovernmentType,
        primaryCulture: 'austrian',
        religion: 'catholic',
        capitalStateId: null,
        ownedStates: [],
        marketId: 'vienna',
        treasury: 400000,
        prestige: 65,
      },
      {
        id: 'usa',
        tag: 'USA',
        nameKey: 'country.usa',
        color: [0, 0, 128],
        countryType: 'playable' as CountryType,
        government: 'republic' as GovernmentType,
        primaryCulture: 'american',
        religion: 'protestant',
        capitalStateId: null,
        ownedStates: [],
        marketId: 'new_york',
        treasury: 1200000,
        prestige: 95,
      },
    ];
    
    for (const country of defaultCountries) {
      this.countries.set(country.id, country);
    }
    
    return this.countries;
  }
  
  getCountry(id: string): Country | undefined {
    return this.countries.get(id);
  }
  
  getAllCountries(): Country[] {
    return Array.from(this.countries.values());
  }
  
  assignProvincesToCountries(world: WorldData): void {
    const countryList = Array.from(this.countries.values());
    let countryIdx = 0;
    
    for (const [provinceId, province] of world.provinces) {
      const country = countryList[countryIdx % countryList.length];
      province.ownerId = country.id;
      
      for (const [stateId, state] of world.states) {
        if (!state.ownerId) {
          state.ownerId = country.id;
          province.stateId = stateId;
          break;
        }
      }
      
      countryIdx++;
    }
  }
  
  load(): LoaderResult {
    const world = this.generateWorld();
    this.loadDefaultCountries();
    this.assignProvincesToCountries(world);
    
    return {
      world,
      countries: this.countries,
      loadedAt: Date.now(),
    };
  }
  
  getLoadedAt(): number | null {
    return this.loadedAt;
  }
}