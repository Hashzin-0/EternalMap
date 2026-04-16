# Technology and Innovation Systems

This document provides comprehensive research on implementing technology and innovation systems for a Victoria-like grand strategy game, drawing from extensive analysis of Victoria 3's mechanics and alternative approaches.

## 1. Technology Spread Mechanics

### What IS

Technology spread is a passive mechanics system that allows nations to unlocked technologies from other nations through diplomatic contact, trade relationships, and geographic proximity without actively researching them. This simulates the real-world phenomenon where innovations naturally diffuse across borders through cultural exchange, trade, espionage, and observation. In Victoria 3, technology spread operates as a parallel research system that always runs in the background regardless of whether the player is actively researching a specific technology.

The mechanics work by having one technology from each of the three technology trees (Production, Military, Society) being passively researched at any given time. Each week, the system assigns random progress points to one unresearched technology within each tree, with the number of points determined by the nation's literacy rate and innovation generation. This creates an element of unpredictability where players may suddenly discover technologies they weren't explicitly researching, encouraging them to adapt their strategies around these "gifts" from technology spread.

Technology spread serves multiple game design purposes: it prevents players from falling too far behind if they neglect research in a particular area, it simulates historical technology diffusion patterns, and it adds strategic depth by allowing players to potentially benefit from other nations' research investments through smart diplomatic positioning. The rate at which technologies spread is influenced by several factors including literacy, trade relationships, diplomatic proximity, and the technology front-tier status of neighboring nations.

### What EXISTS

Several technology spread models exist in strategy games:

**Victoria 3 Model**: This system assigns random progress each week to a single unresearched technology per tree. The spread rate is calculated as (25 + [0.2 × literacy rate]) points per week, meaning nations with higher literacy benefit more from passive spread. Excess innovation beyond the directed research cap (50 + 1.5 × literacy) is directed toward technology spread at a 60% conversion rate, making overcapping partially useful.

**Europa Universalis 4 Model**: Technologies can be gained through institutions spreading from nations that have discovered them, with spread speed depending on proximity and technology cost. This model uses a more deterministic approach where institutions spread geographically over time.

**Civilization Series Model**: Technologies spread through a tech tree with prerequisites, often allowing players to see future technologies but requiring intermediate discoveries first. Some entries also include technology trading between civilizations.

**Stellaris Model**: Technology spread in this game is based on research agreements with other civilizations and explicit data sharing, giving players more control over passive acquisition.

**Alternative Implementation Options**:

- Geographic cluster spread: Technologies spread more quickly between neighboring regions simulating physical proximity
- Trade route spread: Technologies spread through commercial networks
- Diplomatic spread: Technologies spread through formal alliances and relationships
- Intelligence-based spread: Through espionage mechanics
- Cultural spread: Through migration and cultural conversion

### How TO USE

To implement technology spread in your game:

```
interface TechnologySpreadConfig {
  // Base settings
  trees: TechnologyTree[]; // Production, Military, Society
  weeklyProgressPerTree: number; // Base progress per tree per week
  literacyMultiplier: number; // Additional progress per literacy point
  
  // Spread allocation
  excessInnovationConversionRate: number; // 0.60 for 60% conversion
  cappedInnovationContribution: number; // Base innovation cap contribution
  perLiteracyCapBonus: number; // +1.5 per 1% literacy
  
  // Target selection
  randomSelection: boolean; // True = random, False = weighted by AI weight
  eraBiasPenalty: number; // Penalty for targeting later era techs
}

class TechnologySpreadSystem {
  private config: TechnologySpreadConfig;
  private currentSpreadTechs: Map<string, TechnologyID>; // Tree -> current spread target
  private spreadProgress: Map<string, number>; // Tree -> accumulated progress
  
  // Each week, allocate spread to each tree
  processWeeklySpread(
    nation: NationState,
    generatedInnovation: number,
    directedResearchCap: number
  ): SpreadResult[] {
    const results: SpreadResult[] = [];
    
    for (const tree of this.config.trees) {
      const excessInnovation = Math.max(0, generatedInnovation - directedResearchCap);
      const convertedExcess = excessInnovation * this.config.excessInnovationConversionRate;
      const baseSpread = 25 + (nation.literacyRate * 0.2);
      const totalSpread = baseSpread + convertedExcess;
      
      // Progress toward current spread target
      const progress = this.allocateSpreadProgress(tree, nation, totalSpread);
      results.push({ tree, ...progress });
    }
    
    return results;
  }
  
  // Can randomly reallocate if current target is completed
  maybeSelectNewTarget(tree: TechnologyTree, nation: NationState): void {
    const current = this.currentSpreadTechs.get(tree);
    if (!current || this.isTechResearched(current)) {
      this.selectRandomUnresearchedTech(tree, nation);
    }
  }
}
```

The implementation should track which technology is currently receiving spread for each tree and handle completion detection properly. When a technology completes through spread, a new target should be selected, preferably using weighted random selection based on each technology's AI weight.

### How TO INTEGRATE

Technology spread integrates heavily with other game systems:

**With Innovation System**: Technology spread uses excess innovation not directed toward active research. The conversion rate of 60% means overcapping still provides partial benefit, but players must balance directed research with passive spread optimization. The spread also provides an alternative innovation sink when the player has completed all immediately useful technologies.

**With Trade System**: Trade relationships increase the effective spread rate, simulating commercial exchange of ideas. Nations with strong trade connections to technologically advanced nations will receive more valuable spread. Implementation should add a trade modifier: `spreadMod += tradeValue * 0.1` per significant trade relationship.

**With Diplomatic System**: Geographic proximity and diplomatic relations affect spread. Being in a power bloc or having research agreements increases spread rate. Consider adding diplomatic spread bonuses: `spreadMod += relationshipStrength * 0.05` where relationship strength is normalized 0-1.

**With Intelligence System**: Espionage can be used to deliberately target specific technologies for faster acquisition, though this should require active investment rather than being automatic.

### How TO EXPAND

**Tiered Spread Model**: Add multiple spread slots per tree, allowing progress toward multiple technologies simultaneously at lower efficiency.

**Geographic Clusters**: Implement regional innovation hubs where technologies in a geographic cluster (such as Western Europe, East Asia) spread faster to nearby nations.

**Trade Route Bonuses**: Add explicit bonuses for specific trade goods that facilitate research (such as importing scientific equipment or paper).

**Tech Spheres**: Implement Great Power spheres of influence where spherelings receive boosted spread from the patron's discoveries.

**Cultural Unions**: Similar to spheres but for cultural unions, adding bonus spread between culturally related nations.

**Research Agreements**: Allow formal research partnerships that increase mutual spread rate between allies.

### Additional Details

**Spread Rate Formula**: The primary formula is `Spread = (25 + (0.2 × Literacy))` points per week per tree.

**Technology Selection Weight**: Each technology has an AI weight used in weighted random selection. The weight typically ranges from 0.1 (useless technology) to 10.0 (highly valuable technology). Technologies can also have base weights modified by player situation.

**Era Considerations**: Spread should not target technologies that are significantly ahead of the nation's current position in a tree. Implement era bias by reducing selection weight for technologies more than 2 eras ahead.

**Completion Detection**: When a spread target completes, immediately select a new random target from available technologies. Do not allow spread to pause while waiting for player selection.

---

## 2. Innovation Point Generation

### What IS

Innovation points (or research points) are the primary currency used to research technologies in the game. They represent the intellectual and academic output of a nation's population and institutions. Innovation generation forms the fundamental resource loop that drives technological advancement, making it essential to implement correctly for game balance.

In Victoria 3, innovation has several key properties that make its implementation distinctive. All nations start with a base innovation generation of 50 points per week. This base can be increased by constructing universities, with each university level producing additional innovation based on staffing and production method. There is also an innovation capacity cap that limits how much innovation can be directed toward active research, though excess innovation still contributes partially to technology spread.

The innovation system is deliberately designed so that early-game nations cannot rapidly research through entire technology trees, forcing strategic choices about which technologies to pursue actively while allowing slower passive acquisition through technology spread. This creates meaningful progression where advancing through the technology tree takes years or even decades of gameplay rather than being achievable in weeks or months.

### What EXISTS

Several innovation generation model alternatives exist:

**Victoria 3 Model**: Uses a base generation of 50 plus university output, with capacity scaled by literacy. This creates a direct link between education investment and research capacity.

**Civilization-style Model**: Uses a per-city or per-region generation with scaling based on population and buildings.

**Europa Universalis 4 Model**: Uses different institution types based on technology era, each with different spread and cost characteristics.

**Stellaris Model**: Uses a research lab system with separate physics, society, and engineering research tracks.

**Alternative Implementation Options**:

- Population-weighted generation: Innovation based on percentage of population in intellectual roles
- Building-output model: Innovation from university buildings with employment
- Trade-based model: Innovation from importing knowledge goods
- Government-investment model: Direct government funding rather than institution building
- Hybrid models: Combining multiple of the above approaches

### How TO USE

```
interface InnovationConfig {
  // Base generation
  baseInnovationGeneration: number; // 50 for all nations
  baseInnovationCap: number; // 50 for all nations
  
  // Literacy scaling
  perLiteracyCapBonus: number; // +1.5 per 1% literacy
  perLiteracySpreadBonus: number; // +0.2 for spread
  
  // University scaling
  universityBaseOutput: number; // 2 per level
  universityOutputRange: [number, number]; // [2, 4] based on PM
  employmentScaling: number; // Actual output = base × employment ratio
  
  // Bonuses
  prosperityBonuses: Map<string, InnovationBonus>;
  powerBlocBonuses: Map<string, InnovationBonus>;
  techCompanyBonuses: Map<string, number>;
}

interface InnovationState {
  generatedThisWeek: number;
  directedToResearch: number;
  cap: number;
  excessContributingToSpread: number;
}

class InnovationSystem {
  private config: InnovationConfig;
  
  calculateWeeklyGeneration(nation: NationState): InnovationState {
    const universities = nation.buildings.filter(b => b.type === 'university');
    
    let universityOutput = 0;
    for (const uni of universities) {
      const level = uni.level;
      const employmentRatio = uni.employedWorkers / uni.neededWorkers;
      const pm = uni.productionMethod;
      const baseOutput = this.getBaseUniversityOutput(pm);
      universityOutput += level * baseOutput * employmentRatio;
    }
    
    const baseGeneration = this.config.baseInnovationGeneration;
    const totalGenerated = baseGeneration + universityOutput;
    
    // Calculate capacity
    const literacyBonus = Math.floor(nation.literacyRate * this.config.perLiteracyCapBonus);
    const extraBonuses = this.calculateBonuses(nation);
    const cap = this.config.baseInnovationCap + literacyBonus + extraBonuses;
    
    // Directed vs spread allocation
    const directed = Math.min(totalGenerated, cap);
    const excess = totalGenerated - cap;
    const toSpread = excess * this.config.excessInnovationConversionRate;
    
    return {
      generatedThisWeek: totalGenerated,
      directedToResearch: directed,
      cap: cap,
      excessContributingToSpread: toSpread
    };
  }
  
  getBaseUniversityOutput(pm: ProductionMethod): number {
    switch (pm) {
      case 'basic_university': return 2;
      case 'research_institute': return 3;
      case 'modern_research': return 4;
      default: return 2;
    }
  }
  
  calculateBonuses(nation: NationState): number {
    let bonus = 0;
    
    // Check for tech company prosperity bonuses
    for (const company of nation.activeCompanies) {
      if (company.prosperityBonuses?.innovationInvestment) {
        bonus += company.prosperityBonuses.innovationInvestment;
      }
    }
    
    // Power bloc principles
    if (nation.powerBloc) {
      if (nation.powerBloc.principle === 'advanced_research') {
        bonus += nation.educationLevel * 5;
      }
    }
    
    return bonus;
  }
}
```

The innovation generation should be calculated weekly and applied to both directed research and technology spread based on the current capacity. The system tracks both generation and capacity to allow players to strategically optimize both through literacy and university investments.

### How TO INTEGRATE

**With Education Institution**: The Education institution directly affects literacy rate, which increases innovation capacity. Higher Education levels make larger investments in universities more effective.

**With Universities**: Universities are the primary source of additional innovation. Their output depends on staffing levels and production method selection. Paper mills reduce university costs, allowing more universities to be built.

**With Population/Pops System**: Pop literacy directly affects capacity, creating incentive to improve education. Intellectuals generate more innovation than other pop types, creating demand for qualified workers.

**With Building System**: Universities require construction and employment. They require paper as an input, linking construction industry with research capability.

**With Law System**: Education system laws affect how education is delivered (Religious, Private, Public schools) which ultimately affects literacy and thus innovation capacity.

### How TO EXPAND

**Tech Company Prosperity Bonuses**: Add specific tech companies that provide innovation bonuses when they prosper, such as historical examples like Philips or Siemens.

**Power Bloc Principles**: Add power bloc principles (like in Victoria 3) that provide innovation bonuses when selected, especially in spherelings who follow the lead nation's research direction.

**Trade Goods Bonuses**: Add innovations from importing scientific goods, allowing nations without domestic universities to partially compensate through trade.

**Research Agreements**: Implement formal research agreements between nations that provide mutual innovation bonuses.

**Exports**: Implementing university exports as a trade good could provide innovation bonuses to importing nations.

**National Focuses**: Implement national research focuses that sacrifice other generation for accelerated research in specific trees.

### Additional Details

**Weekly Calculation**: Innovation is calculated weekly in Victoria 3, with the game advancing in weekly ticks. This creates a consistent rhythm for research progression.

**Capacity Formula**: The formula for innovation cap is `50 + (literacy × 1.5) + bonuses`. With maximum literacy (after education system is fully developed), the cap reaches approximately 200.

**Excess Innovation Handling**: Excess innovation beyond capacity contributes to technology spread at approximately 60% rate, meaning overcapping still provides partial benefit.

**University Output Range**: Different production methods provide different outputs: Basic = 2, Research Institute = 3, Modern Research = 4 (per level when fully employed).

**Staffing Requirements**: Universities require academics (qualified pops) to function efficiently. Inefficient staffing reduces output proportionally.

---

## 3. Tech Tier Progression

### What IS

Tech tier progression refers to the organization of technologies into distinct tiers or eras that represent different historical periods and research complexity levels. This system ensures that players cannot skip ahead to the most advanced technologies without first developing foundations, creating meaningful progression arcs and strategic decision-making around technology timing.

In Victoria 3, technologies are organized into five eras (Era 1 through Era 5), with each era representing a roughly sequential period of technological development. Era 1 technologies (pre-1836) represent early industrial era discoveries, while Era 5 technologies (1930s+) represent modern innovations. Each era has an associated base innovation cost, with later eras being progressively more expensive.

The era system serves multiple purposes: it provides visual feedback on technological positioning, it penalizes skipping ahead by increasing research costs, and it provides game rhythm by controlling access to late-game technologies. Importantly, there are significant era penalties when a nation attempts to research technologies significantly ahead of their current position, making such attempts extremely inefficient.

### What EXISTS

Several tech tier systems are used in strategy games:

**Victoria 3 System**: Five eras with sequential costs of 7500, 10000, 12500, 15000, and 17500. Era penalties apply when earlier era technologies are unresearched.

**Civilization Systems**: Various tech tree structures including linear, web, and hybrid models with technology ages or eras.

**Paradox Europa Universalis 4**: Institutional system where institutions must be adopted or invented, with era-appropriate institution sets.

**Alternative Implementation Options**:

- Continuous progression: No discrete tiers, continuous cost scaling
- Era gates: Technologies require specific milestones before accessing new eras
- Technology web: Non-linear prerequisite structure
- Tech ages: Broad historical periods (Industrial, Modern, etc.)
- Focus trees: Distinct research paths for different playstyles

### How TO USE

```
interface TechTierConfig {
  eraDefinitions: Era[];
  eraCosts: number[]; // Base cost per era
  eraNames: string[];
  eraPenaltyMultiplier: number; // 0.25 penalty factor
  maxEraDifference: number; // Max 2 era difference allowed
}

interface Era {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
  baseCost: number;
}

interface Technology {
  id: string;
  name: string;
  era: number; // 1-5
  category: 'production' | 'military' | 'society';
  prerequisites: string[]; // Tech IDs required first
  
  // Modifiers provided by this tech when researched
  modifiers: TechnologyModifier[];
  
  // What this tech unlocks
  unlocks?: TechnologyUnlock[];
  
  // AI behavior
  aiWeight: number; // Base selection weight
  baseAiWeight: number; // Minimum weight
}

class TechTierSystem {
  private config: TechTierConfig;
  
  calculateTechCost(tech: Technology, nation: NationState): number {
    const eraCost = this.config.eraCosts[tech.era - 1];
    
    // Get lowest-era unresearched technology in this tree
    const unresearchedInSameTree = nation.unresearchedTechs.filter(
      t => t.category === tech.category && t.era < tech.era
    );
    
    if (unresearchedInSameTree.length === 0) {
      return eraCost;
    }
    
    // Calculate era difference for penalty
    let lowestEra = tech.era;
    for (const unresearched of unresearchedInSameTree) {
      if (unresearched.era < lowestEra) {
        lowestEra = unresearched.era;
      }
    }
    
    const eraDifference = tech.era - lowestEra;
    if (eraDifference <= 1) {
      return eraCost;
    }
    
    // Apply era penalty: each era ahead adds 25% of base cost per unresearched tech
    const penalty = unresearchedInSameTree.length * 
      (eraDifference * this.config.eraPenaltyMultiplier * eraCost);
    
    return eraCost + penalty;
  }
  
  isTechAvailable(tech: Technology, nation: NationState): boolean {
    // Check prerequisites
    for (const prereq of tech.prerequisites) {
      if (!this.isTechResearched(prereq, nation)) {
        return false;
      }
    }
    
    // Check era availability (cannot skip more than 2 eras)
    const eraDiff = this.getCurrentTreeEraDiff(tech.category, tech.era, nation);
    if (eraDiff > this.config.maxEraDifference) {
      return false;
    }
    
    return true;
  }
  
  getCurrentTreeEraDiff(
    category: string, 
    targetEra: number, 
    nation: NationState
  ): number {
    const researched = nation.researchedTechs.filter(
      t => t.category === category
    );
    
    if (researched.length === 0) {
      return targetEra - 1; // Assume starting at era 1
    }
    
    const highestEra = Math.max(...researched.map(t => t.era));
    return targetEra - highestEra;
  }
}
```

The tier system should properly penalize skipping ahead to ensure progression feels meaningful while not making it completely prohibitive. The penalty is substantial but not absolute, allowing determined players to advance but at significant cost.

### How TO INTEGRATE

**With Technology Tree Display**: The UI should clearly show era boundaries and highlight the current era position to help players understand their position in the progression.

**With Starting Technologies**: Nations should start with several technologies already researched based on their historical technological position, typically technologies from Era 1-2.

**With Prestige System**: More technologically advanced nations may receive prestige bonuses, though this should not be the primary incentive.

**With Difficulty Balancing**: The tech tier system provides natural difficulty scaling by controlling which technologies are accessible at different progression stages.

### How TO EXPAND

**Sub-Eras**: Divide each era into early/late sub-eras to provide more granular progression within eras.

**Regional Technology Eras**: Different regions may reach different eras at different times, adding historical authenticity.

**Async Progression**: Allow nations in certain circumstances to access technologies faster than others through events or decisions.

**Tech Revolutions**: Add technology revolutions for specific tech trees when certain thresholds are reached.

**Lost Technologies**: Implement system for losing access to technologies if certain conditions aren't maintained.

### Additional Details

**Era Costs**: Era base costs are 7500, 10000, 12500, 15000, 17500 innovation points respectively.

**Era Penalty Formula**: The penalty formula is `cost + unresearchedCount × eraDifference × 0.25 × eraCost`

**Example Calculation**: If researching an Era 4 technology (cost 15000) with 3 unresearched Era 2 technologies and Era 3 gap of 2, the penalty would be `3 × (2 × 0.25 × 15000) = 2250` additional cost.

**Starting Technologies**: Nations typically start with 20-30 technologies pre-researched representing their historical knowledge base at game start (1836).

---

## 4. Research Queue Management

### What IS

Research queue management allows players to queue multiple technologies for sequential research rather than selecting one at a time and waiting for completion before making the next selection. This system is essential for quality-of-life, reducing the micro-management burden on players while making longer-term strategic planning easier.

In Victoria 3, the queue system works by shift-clicking on a technology to add it to the queue. The queue is processed sequentially, with the next technology automatically beginning research when the previous one completes. If the queue becomes empty, the game pauses waiting for player input (though technology spread continues).

The queue system provides strategic depth through planning, allowing players to pre-plan entire research paths in advance. This is particularly useful for planning technology dependencies where later technologies require specific earlier technologies as prerequisites.

### What EXISTS

**Shift-Click Queue (Victoria 3)**: Adding multiple technologies to a queue by shift-clicking, with sequential processing.

**Manual Queue**: Players explicitly add technologies to a numbered list and can reorder at any time.

**Dependency-Based Queue**: System automatically queues prerequisite technologies when a target technology is queued.

**Focus-Based Queue**: Players select a focus area (Military, Production, Society) and the AI manages the queue within that focus.

**Alternative Implementation Options**:

- Drag-and-drop queue: Direct manipulation of queue order
- Bulk queue: Adding multiple technologies from a selection menu
- Strategy-based queue: AI-managed research based on player strategy
- Automatic queue completion: Auto-fill queue with best technologies

### How TO USE

```
interface ResearchQueueConfig {
  maxQueueLength: number;
  allowReordering: boolean;
  autoQueuePrerequisites: boolean;
  preserveProgressOnCancel: boolean;
  shareProgressOnSwitch: boolean;
}

interface QueueEntry {
  technologyId: string;
  progress: number;
  totalCost: number;
  startedAt: number; // Week
  status: 'researching' | 'queued' | 'waiting';
}

class ResearchQueueSystem {
  private config: ResearchQueueConfig;
  private queue: QueueEntry[] = [];
  private currentResearch: string | null = null;
  
  // Add technology to queue
  enqueue(techId: string, nation: NationState): void {
    if (this.queue.length >= this.config.maxQueueLength) {
      return; // Queue full
    }
    
    const tech = this.getTechnology(techId);
    if (!this.isTechAvailable(tech, nation)) {
      return; // Cannot research yet
    }
    
    this.queue.push({
      technologyId: techId,
      progress: 0,
      totalCost: this.calculateTechCost(tech, nation),
      startedAt: 0,
      status: 'queued'
    });
  }
  
  // Shift-click handler
  handleShiftClick(techId: string, nation: NationState): void {
    // If nothing is currently research, start immediately
    if (!this.currentResearch) {
      this.startResearch(techId, nation);
    } else {
      this.enqueue(techId, nation);
    }
  }
  
  // Process weekly research progress
  processWeekly(nation: NationState, innovation: InnovationState): void {
    if (!this.currentResearch) {
      if (this.queue.length > 0) {
        this.advanceQueue(nation);
      } else {
        return; // Nothing to do
      }
    }
    
    const entry = this.queue.find(e => e.status === 'researching');
    if (!entry) return;
    
    const progressAmount = innovation.directedToResearch;
    entry.progress += progressAmount;
    
    if (entry.progress >= entry.totalCost) {
      this.completeTechnology(entry.technologyId, nation);
      this.advanceQueue(nation);
    }
  }
  
  advanceQueue(nation: NationState): void {
    // Find next queued entry
    const nextIndex = this.queue.findIndex(e => e.status === 'queued');
    if (nextIndex === -1) {
      this.currentResearch = null;
      return;
    }
    
    const next = this.queue[nextIndex];
    next.status = 'researching';
    next.startedAt = this.getCurrentWeek();
    this.currentResearch = next.technologyId;
    
    // Shift remaining entries up
    const [completed] = this.queue.splice(nextIndex, 1);
    this.queue.unshift(completed);
  }
  
  // Cancel current research (preserves partial progress)
  cancelCurrent(nation: NationState): void {
    if (!this.currentResearch) return;
    
    const current = this.queue.find(e => e.status === 'researching');
    if (current && this.config.preserveProgressOnCancel) {
      // Keep current progress in temporary storage
      this.storeProgressBonus(current.technologyId, current.progress);
    }
  }
}
```

The queue implementation should support shift-clicking for quick queue addition while also providing a visible queue interface showing all queued technologies, their progress, and allowing potential reordering or removal.

### How TO INTEGRATE

**With Technology Tree UI**: Click handlers should integrate with the technology tree interface, with the queue showing progress status for each.

**With Technology Spread**: Technology spread continues even when queue is active, potentially completing technologies the player wasn't planning to research, adding strategic unpredictability.

**With Progress Saving**: Partial progress should be saved when switching technologies (at reduced rate as in Victoria 3, or preserved as configured).

### How TO EXPAND

**Drag-and-Drop Reordering**: Allow players to reorder the queue by dragging entries up or down.

**Priority Queue**: Allow marking specific queued technologies as higher priority, jumping them ahead in the queue.

**Bulk Add**: Allow adding entire technology branches to the queue at once.

**Queue Recommendations**: Add AI recommendations for optimal queue based on player strategy.

**Queue Export/Import**: Allow saving and loading queue configurations for different game phases.

### Additional Details

**Progress Preservation**: When switching technologies in Victoria 3, progress is preserved at 100% rate. This means players can abandon one technology and return later without penalty.

**Queue Display**: The queue should be clearly visible in the technology interface, showing current progress, remaining cost, and upcoming queue items.

**Completion Handling**: When a queued technology completes, the game should automatically advance to the next in queue without requiring player input, minimizing micro-management.

**Queue Reset**: The queue can be cleared if all queued technologies become invalid (due to prerequisites changing or technology being made unavailable).

---

## 5. Technology Requirements and Dependencies

### What IS

Technology requirements and dependencies define the prerequisite structure that governs which technologies can be researched and when. These create meaningful progression paths where advanced technologies require foundation technologies to be discovered first. This dependency structure is fundamental to providing strategic depth and preventing technology tree gaming.

In Victoria 3, dependencies work through two primary mechanisms: prerequisite technologies (unlocking_technologies) that must be fully researched before the dependent technology becomes available, and era gates that penalize attempting to research technologies from eras far ahead of current progress.

Some technologies also have hard dependencies with other systems, such as requirements to have certain laws enacted, buildings constructed, or production methods adopted. This ensures technology unlocks are meaningful by requiring the nation to be prepared to use them.

### What EXISTS

**Direct Prerequisites (Victoria 3)**: Listing specific unlocking_technologies that must be completed first.

**Era Gates**: Penalizing research of technologies from eras far ahead of current position.

**Building Requirements**: Requiring specific buildings to be constructed.

**Law Requirements**: Requiring specific laws to be enacted.

**PM Requirements**: Requiring specific production methods.

**Resource Requirements**: Requiring certain resources to be accessible.

**Alternative Implementation Options**:

- OR dependencies: Any one of several technologies can enable access
- AND+OR combinations: Complex prerequisite trees
- Soft recommendations: Technologies that recommend but don't require others
- Hidden dependencies: Technologies that unlock others but aren't immediately obvious

### How TO USE

```
interface TechDependenciesConfig {
  allowSoftRecommendations: boolean;
  maxEraPenalty: number; // Maximum era penalty
  showAllDependencies: boolean; // Show dependency chains in UI
}

interface TechnologyRequirement {
  type: 'technology' | 'building' | 'law' | 'productionMethod' | 'resource' | 'era';
  id: string;
  count?: number; // For building counts
}

class TechDependencySystem {
  private config: TechDependenciesConfig;
  
  // Check all requirements for a technology
  checkRequirements(tech: Technology, nation: NationState): RequirementCheck {
    const results: RequirementResult[] = [];
    
    // Check technology prerequisites
    for (const prereqId of tech.prerequisites) {
      const prereq = this.getTechnology(prereqId);
      const isResearched = this.isTechResearched(prereqId, nation);
      results.push({
        type: 'technology',
        name: prereq.name,
        satisfied: isResearched,
        required: true
      });
    }
    
    // Check any additional requirements
    if (tech.requiredBuildings) {
      for (const req of tech.requiredBuildings) {
        const count = nation.getBuildingCount(req.buildingType);
        results.push({
          type: 'building',
          name: req.buildingType,
          satisfied: count >= req.count,
          required: true,
          current: count,
          needed: req.count
        });
      }
    }
    
    if (tech.requiredLaws) {
      for (const req of tech.requiredLaws) {
        const lawActive = nation.isLawActive(req.lawType);
        results.push({
          type: 'law',
          name: this.getLawName(req.lawType),
          satisfied: lawActive,
          required: true
        });
      }
    }
    
    // Check era constraint
    const eraDiff = this.getEraDifference(tech, nation);
    if (eraDiff > this.config.maxEraPenalty) {
      results.push({
        type: 'era',
        name: `Era ${tech.era}`,
        satisfied: false,
        required: true,
        info: `Too far ahead (max ${this.config.maxEraPenalty} eras)`
      });
    }
    
    return {
      technologyId: tech.id,
      satisfied: results.every(r => r.satisfied),
      requirements: results
    };
  }
  
  // Get all technologies that could be researched next
  getAvailableTechs(nation: NationState): Technology[] {
    const allTech = this.getAllTechs();
    const available: Technology[] = [];
    
    for (const tech of allTech) {
      if (!this.isTechResearched(tech.id, nation)) {
        const check = this.checkRequirements(tech, nation);
        if (check.satisfied) {
          available.push(tech);
        }
      }
    }
    
    return available;
  }
  
  // Visualize dependency chain for UI
  getDependencyChain(tech: Technology): DependencyNode[] {
    const nodes: DependencyNode[] = [];
    const visited = new Set<string>();
    
    const traverse = (t: Technology, depth: number) => {
      if (visited.has(t.id)) return;
      visited.add(t.id);
      
      for (const prereqId of t.prerequisites) {
        const prereq = this.getTechnology(prereqId);
        traverse(prereq, depth + 1);
      }
      
      nodes.push({
        id: t.id,
        name: t.name,
        depth,
        isPrerequisite: depth > 0
      });
    };
    
    traverse(tech, 0);
    return nodes;
  }
}
```

The dependency system should provide clear feedback to players, showing which requirements are met and which aren't, and should integrate with the technology tree display to visually indicate locked/unavailable technologies.

### How TO INTEGRATE

**With Technology Tree Display**: Show locked/locked technologies differently in the tree view, with tooltips showing missing requirements.

**With Law System**: Technology can define required laws, with those laws unlocking the technology when enacted.

**With Building System**: Technologies can require buildings, ensuring they're only available when the nation has progressed sufficiently to use them.

**With Production Method System**: Technologies that unlock new PMs should require the relevant buildings to be constructed first.

### How TO EXPAND

**Hidden Dependencies**: Some technologies can have hidden dependencies that are revealed gradually (for discovery gameplay).

**OR Dependencies**: Technology could require any one of several alternative technologies, providing strategic choices.

**Conditional Unlocks**: Dependencies that are only required under certain game states (such as for certain nations).

**Tech Trading**: Dependencies could potentially be fulfilled through tech sharing/trading with other nations.

### Additional Details

**Availability Check**: Technologies should be marked as available or unavailable in the tree view, with clear indicators for why (missing prerequisites, era too far ahead, etc.)

**Chain Display**: The dependency chain for a technology can be several levels deep, so UI must handle this gracefully.

**Reverse Dependencies**: Players should be able to see which technologies depend on a currently researched technology (reverse lookup).

---

## 6. Tech Research Speed Modifiers

### What IS

Research speed modifiers are bonuses and penalties that affect how quickly technologies can be researched beyond the base innovation-to-progress conversion. These create strategic depth by allowing nations to research faster through various investments and decisions, while also providing balanced disadvantages to nations in certain situations.

In Victoria 3, the primary modifiers come from the innovation cap (which limits directed research) and the innovation generation rate (which determines how much innovation can be applied). However, there are also direct research speed bonuses from various sources that multiply research progress.

Research speed is calculated as a percentage: base 100% plus bonuses minus penalties. At 100%, research progress equals innovation input. At 200%, research progresses at double speed. Modifiers can make significant changes to research time, making certain strategies very powerful.

### What EXISTS

**Innovation Cap**: Limiting directed research, effectively capping speed at high innovation levels.

**Innovation Generation Rate**: The base and bonus innovation generated per week.

**National Focus Bonuses**: Strategic decisions or focuses that increase research speed in a specific tree.

**IG Mood Bonuses**: Interest group leader bonuses when the IG is happy.

**Power Bloc Bonuses**: Research bonuses from power bloc membership or leadership.

**Trade Bonuses**: Research bonuses from importing specific goods.

**Alternative Implementation Options**:

- Government focus: Direct research bonuses for selecting specific focus
- Pop employment bonuses: Research bonuses from having qualified pops in research
- Building bonuses: Direct bonuses from special research buildings
- Geographic bonuses: Regional research advantages
- Event-based bonuses: One-time bonuses from events or decisions

### How TO USE

```
interface ResearchSpeedConfig {
  baseMultiplier: number; // 1.0 = 100%
  minMultiplier: number;
  maxMultiplier: number;
  bonusSources: Map<string, ResearchBonus>;
}

interface ResearchBonus {
  sourceId: string;
  sourceName: string;
  bonusValue: number;
  isPercentage: boolean; // True = percentage bonus, False = flat bonus
  appliesTo: 'all' | 'production' | 'military' | 'society';
}

class ResearchSpeedSystem {
  private config: ResearchSpeedConfig;
  
  calculateResearchSpeed(
    nation: NationState,
    targetTree: TechnologyTree
  ): number {
    let multiplier = this.config.baseMultiplier;
    
    // Get all applicable bonuses
    const applicableBonuses = this.getApplicableBonuses(nation, targetTree);
    
    for (const bonus of applicableBonuses) {
      if (bonus.isPercentage) {
        multiplier *= (1 + bonus.bonusValue);
      } else {
        // Flat bonus converted to percentage
        // Would need innovation input for conversion
        multiplier += bonus.bonusValue / this.getAvgInnovationInput(nation);
      }
    }
    
    // Apply penalties (negative bonuses)
    const applicablePenalties = this.getApplicablePenalties(nation, targetTree);
    for (const penalty of applicablePenalties) {
      if (penalty.isPercentage) {
        multiplier *= (1 - penalty.bonusValue);
      }
    }
    
    // Clamp to valid range
    return Math.max(
      this.config.minMultiplier,
      Math.min(this.config.maxMultiplier, multiplier)
    );
  }
  
  getApplicableBonuses(
    nation: NationState, 
    targetTree: TechnologyTree
  ): ResearchBonus[] {
    const bonuses: ResearchBonus[] = [];
    
    // Interest group leader bonuses
    for (const ig of nation.interestGroups) {
      if (ig.leader && ig.leader.researchBonus) {
        bonuses.push({
          sourceId: `ig_${ig.id}`,
          sourceName: `${ig.leader.name} (${ig.name})`,
          bonusValue: ig.leader.researchBonus,
          isPercentage: true,
          appliesTo: ig.affectedTree || 'all'
        });
      }
    }
    
    // Power bloc bonuses
    if (nation.powerBloc) {
      const blocBonus = this.getPowerBlocResearchBonus(
        nation, 
        targetTree
      );
      if (blocBonus) {
        bonuses.push(blocBonus);
      }
    }
    
    // National decisions/focuses
    for (const decision of nation.activeDecisions) {
      const decisionBonus = this.config.bonusSources.get(decision.id);
      if (decisionBonus) {
        bonuses.push(decisionBonus);
      }
    }
    
    return bonuses;
  }
  
  // Apply to innovation progress calculation
  calculateProgressWithSpeed(
    innovationInput: number,
    speedMultiplier: number
  ): number {
    return innovationInput * speedMultiplier;
  }
}
```

The research speed system should provide various sources of bonuses to create strategic options, while also providing penalties for challenging game states (such as war or economic crisis) to create balance.

### How TO INTEGRATE

**With Innovation System**: Research speed operates as a multiplier on innovation input, making higher innovation more valuable.

**With Interest Group System**: Happy interest group leaders can provide research bonuses, typically aligned with their interests (military IGs provide military research bonus, etc.

**With Power Bloc System**: Power blocs can provide research bonuses to spherelings following a lead nation's tech direction.

**With Event System**: Events and decisions can provide one-time or ongoing research speed bonuses.

### How TO EXPAND

**Tech Company Bonuses**: Specific tech companies provide research speed bonuses when they achieve prosperity.

**Research Agreements**: Bilateral agreements that provide mutual research speed bonuses.

**National Focuses**: Temporary focuses that sacrifice other bonuses for research speed in a specific area.

**Geographic Bonuses**: Regional research clusters could provide regional bonuses (e.g., "Silicon Valley effect").

**War Penalties**: Research slower during wartime to create strategic tradeoffs.

### Additional Details

**Speed Display**: Research speed should be clearly displayed in the research interface as a percentage.

**Bonus Stacking**: Multiple bonuses should typically stack multiplicatively, though some games use additive stacking for simplicity.

**Source Tracking**: Players should be able to see which bonuses are active and from what source.

**Effective Innovation**: The "effective innovation" for progress calculation is `innovation × speedMultiplier`.

---

## 7. University and Institution Effects on Research

### What IS

Universities are the primary institutional buildings that drive research capability in Victoria-like games. They represent higher education facilities that employ academics to generate innovation and push forward technological development. Their output depends on level, staffing, production method selection, and various modifiers.

Institutions in Victoria 3 represent different aspects of national capability beyond higher education, with Education being the primary institution affecting research. The institution system provides a way to develop national capabilities across multiple dimensions including bureaucracy, education, health, and more, each affecting different game systems.

Universities also provide qualifications that enable pops to take higher-skilled jobs, making them essential for industrial development in addition to their research function. This dual-purpose design creates meaningful decisions around university placement and expansion.

### What EXISTS

**Victoria 3 Universities**: Building providing innovation, with level scaling, production method options for different specializations, and staffing requirements.

**Alternative University Systems**:

- Campus-based: Universities as distinct regional campuses with unique bonuses
- Research institutes: Specialized research facilities (separate from universities)
- Corporate R&D: Company-based research facilities
- Libraries: Pre-university research institutions
- Academies: Specialized training institutions

**Institution Systems**:

- Single institution: Only Education affecting research
- Multiple institutions: Different aspects affecting different research types
- Nested institutions: Institution trees with progression

### How TO USE

```
interface UniversityConfig {
  baseInnovationOutput: number; // Per level when staffed
  productionMethods: ProductionMethod[];
  staffingRequirementPerLevel: number;
  employmentBuilding: boolean;
  
  // Costs
  baseConstructionCost: number;
  costScaling: number; // Per level
  inputGoods: Map<string, number>; // Goods required
}

interface University extends Building {
  type: 'university';
  level: number;
  productionMethod: string;
  employedAcademics: number;
  output: number;
}

class UniversitySystem {
  private config: UniversityConfig;
  
  calculateOutput(university: University): number {
    const level = university.level;
    const employmentRatio = university.employedAcademics / 
      (level * this.config.staffingRequirementPerLevel);
    
    const clampedRatio = Math.min(1, employmentRatio);
    const baseOutput = this.getBaseOutput(university.productionMethod);
    
    // Throughput bonuses from various sources
    const throughputBonus = this.getThroughputBonus(university);
    
    return level * baseOutput * clampedRatio * throughputBonus;
  }
  
  getBaseOutput(pm: string): number {
    const method = this.config.productionMethods.find(m => m.id === pm);
    return method?.innovationOutput || this.config.baseInnovationOutput;
  }
  
  getThroughputBonus(university: University): number {
    let bonus = 1.0;
    
    // Add modifier bonuses from various sources
    // - National modifiers
    // - Pop traits
    // - Building synergies
    // - Events
    // - Decisions
    
    return bonus;
  }
  
  // Handle paper consumption (reduces costs)
  getInputGoods(university: University): Map<string, number> {
    const level = university.level;
    const method = this.getProductionMethod(university.productionMethod);
    
    const inputs = new Map<string, number>();
    
    // Base paper requirement
    const paperRequired = level * method.paperConsumption;
    inputs.set('paper', paperRequired);
    
    // Additional inputs based on PM
    for (const [good, amount] of method.additionalInputs) {
      inputs.set(good, level * amount);
    }
    
    return inputs;
  }
  
  // Staffing requirements
  getStaffingRequirement(level: number): number {
    return level * this.config.staffingRequirementPerLevel;
  }
  
  canConstruct(state: State, level: number): ConstructionCheckResult {
    const canBuild = state.canBuildBuilding('university');
    const cost = this.calculateConstructionCost(state, level);
    const inputs = this.getInputRequirements(level);
    
    return {
      canBuild,
      cost,
      inputs,
      blockers: this.getBuildBlockers(state)
    };
  }
}
```

The university system should integrate with the building system and provide meaningful decisions around construction, staffing, and production method selection. Universities should be expensive but powerful investments that require supporting infrastructure (paper production, qualified pops) to function efficiently.

### How TO INTEGRATE

**With Pop System**: Universities require academics (qualified pops), creating demand for education and driving pop type transitions.

**With Building System**: University construction integrates with construction system, using construction points and goods.

**With Input System**: Universities consume paper and potentially other goods, creating supply chain connections.

**With Institution System**: Education institution level affects university capacity and efficiency, while universities contribute to national education access.

**With Qualifications System**: Universities produce qualifications enabling pops to take advanced roles.

### How TO EXPAND

**University Specializations**: Different universities could specialize in different research areas (production, military, society), providing focused bonuses.

**Teaching Hospitals**: Medical research facilities that could tie into health institution.

**Corporate Research Labs**: Private sector R&D that provides innovation in addition to universities.

**Research Zones**: Geographic clustering of research facilities that provides synergy bonuses.

**Nobel Labs**: Special late-game research facilities with exceptional output.

### Additional Details

**Output Calculation**: `Innovation = Level × PM_Output × Employment_Ratio × Throughput_Multipliers`

**Staffing**: Each level requires academics equal to the staffing requirement per level.

**Production Methods**: Three options exist (Basic University 2, Research Institute 3, Modern Research 4).

**Paper Input**: Universities convert paper to innovation with some efficiency, making paper a critical research input.

**Qualifications**: Universities generate qualifications enabling pop advancement to higher roles.

---

## 8. Technology Unlocking Buildings/PMs/Laws

### What IS

Technology unlocks are the primary mechanism by which technology affects broader gameplay in Victoria-like strategy games. Technologies represent new ideas that enable new possibilities across several systems: buildings that can be constructed, production methods that can be adopted for existing buildings, laws that can be enacted, military units and doctrines, and various other mechanics.

In Victoria 3, most technologies primarily serve as unlockers rather than providing direct bonuses. When a technology is researched, it makes available certain other elements that were previously locked. This design choice creates meaningful technology decisions because players must research technologies to access new gameplay rather than researching for pure statistical advantages.

The unlock system is designed to be transparent—players can see what a technology unlocks either through the technology tree interface or through the elements themselves (which show their technology requirements). This ensures players can make informed decisions about research priorities.

### What EXISTS

**Building Unlocks**: Technologies that enable new building types.

**Production Method Unlocks**: Technologies that enable new PMs for existing buildings.

**Law Unlocks**: Technologies that enable new laws.

**Military Unit Unlocks**: Technologies that enable new military units.

**Leader Ideology Unlocks**: Technologies that enable new leader political ideologies.

**Goods Unlocks**: Technologies that unlock new trade goods.

**Alternative Unlock Systems**:

- Tech-led unlocks: Technology directly unlocks new elements
- Requirement-based: Elements define their own requirements
- Hybrid: Mix of the above

### How TO USE

```
interface UnlockDefinition {
  type: 'building' | 'productionMethod' | 'law' | 'militaryUnit' | 'good';
  id: string;
}

interface Technology {
  id: string;
  
  // Direct modifiers when researched
  modifiers?: TechnologyModifier[];
  
  // What this technology unlocks
  unlocks?: UnlockDefinition[];
}

class UnlockSystem {
  // When technology is researched, apply unlocks
  applyTechnologyUnlocks(
    tech: Technology,
    nation: NationState
  ): UnlockResult[] {
    if (!tech.unlocks) return [];
    
    const results: UnlockResult[] = [];
    
    for (const unlock of tech.unlocks) {
      switch (unlock.type) {
        case 'building':
          results.push(this.unlockBuilding(unlock.id, nation));
          break;
        case 'productionMethod':
          results.push(this.unlockProductionMethod(unlock.id, nation));
          break;
        case 'law':
          results.push(this.unlockLaw(unlock.id, nation));
          break;
        case 'militaryUnit':
          results.push(this.unlockMilitaryUnit(unlock.id, nation));
          break;
        case 'good':
          results.push(this.unlockGood(unlock.id, nation));
          break;
      }
    }
    
    return results;
  }
  
  // Check if element is available to player
  isElementAvailable(
    elementType: string,
    elementId: string,
    nation: NationState
  ): boolean {
    const element = this.getGameElement(elementType, elementId);
    if (!element) return false;
    
    if (element.requiredTechnology) {
      return this.isTechResearched(element.requiredTechnology, nation);
    }
    
    // Some elements have additional requirements
    if (element.requiredBuilding) {
      const hasBuilding = nation.buildings.some(
        b => b.type === element.requiredBuilding
      );
      if (!hasBuilding) return false;
    }
    
    if (element.requiredLaw) {
      const lawActive = nation.activeLaws.includes(element.requiredLaw);
      if (!lawActive) return false;
    }
    
    return true;
  }
  
  // Get display info for UI
  getUnlockInfoForTech(tech: Technology): UnlockDisplayInfo[] {
    const info: UnlockDisplayInfo[] = [];
    
    if (!tech.unlocks) return info;
    
    for (const unlock of tech.unlocks) {
      const element = this.getGameElement(unlock.type, unlock.id);
      info.push({
        type: unlock.type,
        id: unlock.id,
        name: element?.name || unlock.id,
        description: element?.description || '',
        icon: element?.icon || '',
        rarity: element?.rarity || 'common'
      });
    }
    
    return info;
  }
}

// Buildings define their technology requirements
const buildingDefinition = {
  id: 'steel_mill',
  name: 'Steel Mill',
  description: 'Produce steel using the Bessemer process',
  requiredTechnology: 'steelworking', // Unlocked by this tech
  constructionCost: 1500,
  inputs: { iron: 100, coal: 50 },
  outputs: { steel: 50 }
};
```

The unlock system should integrate deeply with the game element definitions and provide clear UI feedback about what becomes available when each technology is researched.

### How TO INTEGRATE

**With Technology Tree UI**: Show lock/unlock icons clearly, and display what each technology unlocks.

**With Building Browser**: Buildings should show their technology requirements, making it clear why they can't be constructed.

**With Law Browser**: Laws should similarly show their technology requirements.

**With PM Browser**: Production method selectors should show their requirements.

**With Notification System**: Notify players when new options become available from new technology research.

### How TO EXPAND

**Unlock Categories**: Group unlocks by category for easier discovery.

**Sequential Unlocks**: Some unlocks require multiple technologies in sequence.

**Conditional Unlocks**: Unlocks that depend on game state, not just technology.

**Hidden Unlocks**: Some unlocks that aren't obvious until discovered.

**Event-Based Unlocks**: Unlocks that require both technology and specific events.

### Additional Details

**Building Unlocks**: Technology-defined buildings that require the tech to be constructed.

**PM Unlocks**: New production methods selectable for relevant buildings, providing different efficiency/profitability tradeoffs.

**Law Unlocks**: Political options requiring new societal concepts.

**Unit Unlocks**: Military units and naval units requiring specific technologies.

**Unlock Display**: Each technology should have clear indication of what it unlocks in the tree view and when applicable.

---

## 9. Research Speed from Trade and Literacy

### What IS

Research speed from trade and literacy represents indirect influence on research capability that doesn't come from direct research investment but from broader national development. This creates meaningful connections between macroeconomic development and technological progress, simulating how real-world economic development drives innovation.

Literacy affects research through two mechanisms: innovation capacity (how much innovation can be directed toward active research) and technology spread rate (the passive research from foreign technologies). Higher literacy nations can direct more innovation toward active research and benefit more from technology spread, creating a compounding advantage.

Trade affects research through multiple mechanisms: importing scientific goods, commercial exchange of ideas through trade relationships, and specific trade goods bonuses. Nations with strong trade networks benefit from both the ideas flowing through those networks and the economic prosperity that enables more research investment.

### What EXISTS

**Literacy Effects**: Dual effect on innovation capacity and technology spread rate.

**Trade Effects**: Commercial relationships boost spread rate, importing specific goods provides direct research bonuses.

**Education System Effects**: Law-based education systems that affect how education is delivered.

**Alternative Approaches**:

- Direct trade good bonuses: Specific goods providing research bonuses
- Trade route bonuses: Research bonuses for having trade routes to certain regions
- Commercial center bonuses: Regional commercial hubs providing research bonuses
- Import dependence: Nations dependent on foreign tech receive spread bonuses

### How TO USE

```
interface ResearchFromTradeAndLiteracyConfig {
  // Literacy effects
  literacyCapBonus: number; // +1.5 per 1% literacy
  literacySpreadBonus: number; // +0.2 per week spread
  maxLiteracyCapBonus: number; // Cap on literacy bonus
  
  // Trade effects
  tradeSpreadBonus: number; // Per significant trade relationship
  tradeGoodsBonuses: Map<string, TradeGoodBonus>;
  tradeRouteBonus: number; // For trade routes to advanced nations
}

interface LiteracyAndResearchSystem {
  calculateLiteracyBonuses(nation: NationState): LiteracyResearchBonus {
    const literacy = nation.literacyRate;
    
    // Innovation capacity bonus
    const capBonus = Math.floor(literacy * this.config.literacyCapBonus);
    
    // Technology spread bonus
    const spreadBonus = literacy * this.config.literacySpreadBonus;
    
    return {
      innovationCapBonus: capBonus,
      technologySpreadBonus: spreadBonus
    };
  }
  
  calculateTradeBonuses(nation: NationState): TradeResearchBonus {
    let spreadBonus = 0;
    let goodsBonus = 1.0;
    
    // Relationship-based spread
    const tradePartners = nation.tradeRelationships;
    spreadBonus += tradePartners.length * this.config.tradeSpreadBonus;
    
    // Trade good bonuses
    for (const good of nation.importedGoods) {
      const bonus = this.config.tradeGoodsBonuses.get(good);
      if (bonus) {
        goodsBonus *= (1 + bonus.bonusValue);
      }
    }
    
    // Trade route to advanced nation bonus
    for (const route of nation.tradeRoutes) {
      if (route.target.isAdvancedNation) {
        spreadBonus += this.config.tradeRouteBonus;
      }
    }
    
    return {
      spreadBonus,
      goodsMultiplier: goodsBonus
    };
  }
  
  // Combined calculation
  calculateEffectiveResearchSpeed(
    nation: NationState,
    baseInnovation: number,
    tree: TechnologyTree
  ): number {
    const literacy = this.calculateLiteracyBonuses(nation);
    const trade = this.calculateTradeBonuses(nation);
    
    // Base from innovation
    let effective = baseInnovation;
    
    // Add spread bonus (innovation points)
    effective += literacy.technologySpreadBonus;
    effective += trade.spreadBonus;
    
    // Apply goods multiplier
    effective *= trade.goodsMultiplier;
    
    return effective;
  }
}
```

Trade and literacy bonuses should be calculated separately and combined in the research speed calculation. They provide meaningful bonuses but should not dominate primary research from universities, keeping the strategic focus on university investment.

### How TO INTEGRATE

**With Education System**: Education laws and institution levels drive literacy, creating another reason to invest in education beyond just for research.

**With Trade System**: Trade routes provide research bonuses through spread, incentivizing trade network development.

**With Pop System**: Literacy is a pop attribute that improves over time with education access, creating a feedback loop.

### How TO EXPAND

**Scientific Goods**: Add special trade goods that specifically provide research bonuses.

**Tech Transfer Agreements**: Formal agreements specifically for research exchange.

**Trade Sanctions**: Negative effects when trade is restricted.

**Import Substitution Penalties**: Penalties for not developing domestic research capability.

**Commercial Espionage**: Active stealing of technology through trade networks.

**Academic Exchange**: University exchange programs providing research bonuses.

### Additional Details

**Literacy Range**: Literacy typically ranges from 1% (uneducated) to 100% (fully educated national population).

**Trade Partner Bonus**: Each significant trade partner adds to technology spread rate.

**Research Slows Without Trade**: Isolated nations can still research but at reduced rates, making trade strategically valuable but not mandatory.

---

## 10. AI Research Prioritization

### What IS

AI research prioritization defines how the game's AI manages technology research to create competitive AI opponents that make reasonable technology decisions. This is essential for single-player games as it provides challenging opponents who develop reasonable technology strategies without needing to micro-manage everything.

The AI research system needs to evaluate available technologies, weigh their strategic value given current game state, and select appropriate research targets. The weighting should be strategic rather than purely optimal, creating AI opponents that play believably rather than perfectly.

The AI also needs to handle technology spread (which should continue even when the AI isn't explicitly researching) and queue management, making it behave similarly to a human player in research matters.

### What EXISTS

**Value-Weighted Selection**: AI weights for each technology based on strategic value.

**Opponent-Aware Weighting**: Technologies weighted relative to player capabilities.

**Difficulty Scaling**: AI gets different weights/modifiers at different difficulty levels.

**Strategic Focus Areas**: AI has different strategic priorities by nation type.

**Alternative AI Systems**:

- Hard-coded priorities: Fixed technology priority orders
- Utility-based: Utility functions evaluating each technology
- Neural network: Learned evaluation from game outcomes
- Player modeling: Adjusting based on perceived player strategy

### How TO USE

```
interface AIResearchConfig {
  difficultyModifiers: DifficultyModifier[];
  strategicFactors: StrategicFactor[];
  evaluationPeriod: number; // Update frequency
}

interface DifficultyModifier {
  difficulty: 'veryEasy' | 'easy' | 'normal' | 'hard' | 'veryHard';
  costMultiplier: number;
  spreadBonus: number;
  modifier: number;
}

interface TechnologyAIWeight {
  baseWeight: number;
  strategicMultipliers: Map<string, number>;
  currentWeight: number;
}

class AIResearchSystem {
  // Periodic weight recalculation
  recalculateWeights(aiNation: NationState): void {
    const availableTechs = this.getAvailableTechs(aiNation);
    
    for (const tech of availableTechs) {
      const weight = this.calculateTechWeight(tech, aiNation);
      this.techWeights.set(tech.id, weight);
    }
  }
  
  calculateTechWeight(
    tech: Technology,
    nation: NationState
  ): TechnologyAIWeight {
    // Base weight from technology definition
    let weight = tech.aiWeight;
    
    // Apply strategic multipliers
    const multipliers = this.getStrategicMultipliers(nation, tech);
    for (const [factor, mult] of multipliers) {
      weight *= mult;
    }
    
    // Urgency modifier: need certain techs more urgently
    const urgency = this.calculateUrgency(tech, nation);
    weight *= urgency;
    
    // Difficulty modifier
    const diffMult = this.getDifficultyMultiplier(nation.difficulty);
    weight *= diffMult;
    
    return {
      baseWeight: tech.aiWeight,
      strategicMultipliers: multipliers,
      currentWeight: weight
    };
  }
  
  getStrategicMultipliers(
    nation: NationState,
    tech: Technology
  ): Map<string, number> {
    const mults = new Map<string, number>();
    
    // Economic need: Need production tech if economically weak
    if (tech.category === 'production') {
      const gdpGap = this.compareToPlayerGDP(nation);
      if (gdpGap < 0.8) {
        mults.set('economy', 2.0);
      }
    }
    
    // Military threat: Need military tech if under threat
    const threats = nation.perceivedThreats;
    if (tech.category === 'military' && threats.length > 0) {
      mults.set('defense', 1.5);
    }
    
    // Law need: Society tech unlocks needed laws
    if (tech.category === 'society') {
      const neededLaws = this.getNeededLaws(nation);
      if (neededLaws.includes(tech.id)) {
        mults.set('law', 1.8);
      }
    }
    
    // Resource need: Unlock needed resources
    if (tech.unlocks?.some(u => u.type === 'resource')) {
      const resourceNeed = this.getUnmetResourceNeeds(nation);
      if (resourceNeed > 0) {
        mults.set('resource', 2.0);
      }
    }
    
    return mults;
  }
  
  // Select best technology
  selectTechnology(nation: NationState): Technology {
    // Get weights
    const weights = Array.from(this.techWeights.values());
    
    // Add some randomness to avoid deterministic behavior
    for (const w of weights) {
      w.currentWeight *= (0.8 + Math.random() * 0.4);
    }
    
    // Sort by weight
    weights.sort((a, b) => b.currentWeight - a.currentWeight);
    
    // Select from top candidates with probability weighting
    return this.weightedRandomSelect(weights.slice(0, 5));
  }
  
  // Handle technology spread
  handleSpread(aiNation: NationState): void {
    // Spread continues automatically; AI monitors and may switch if
    // a spread-acquired technology would be more valuable than current
    const currentResearch = this.getCurrentResearch(aiNation);
    const possibleSpread = this.getPossibleSpreadTechs(aiNation);
    
    for (const possibility of possibleSpread) {
      const currentWeight = this.techWeights.get(currentResearch.id);
      const spreadWeight = this.calculateTechWeight(possibility, aiNation);
      
      // If spread target is significantly better, switch
      if (spreadWeight.currentWeight > currentWeight.currentWeight * 1.5) {
        this.switchToTechnology(possibility, aiNation);
        break;
      }
    }
  }
}
```

The AI research system should create opponents that develop reasonably varied strategies and respond to game state without playing optimally or perfectly. The weights and difficulty modifiers should result in challenging but beatable opponents.

### How TO INTEGRATE

**With Difficulty System**: Different difficulty levels get different weight adjustments and modifier bonuses/penalties.

**With Nation AIs**: Each AI-controlled nation can have different strategic priorities based on their nation type (economic/military/balanced).

**With Technology Spread**: AI should react to technology spread changes, potentially switching if a spread-acquired technology is highly valuable.

**With Game State**: AI should adjust weights over time as game state changes.

### How TO EXPAND

**Personality Modifiers**: Different AI "personalities" (aggressive, defensive, economic) use different weight strategies.

**Learning AI**: AI that adjusts based on player strategy, recognizing when the player is ahead somewhere and responding.

**Team AI**: AI nations in teams coordinate research priorities.

**Historical Focus**: AI prioritizes historically appropriate technologies for their nation type.

**Grievance Response**: AI prioritizes technologies to address player actions (such as blocking the player).

### Additional Details

**Weight Ranges**: Technology AI weights typically range from 0.1 (useless when irrelevant) to 10.0 (highly valuable).

**Recalculation Frequency**: Weights should be recalculated periodically (every few in-game years or when game state changes significantly).

**Difficulty Modifiers**: The very easy difficulty gives AI a 0.5 research speed modifier, very hard gives 1.5.

**Spread Handling**: AI should continue technology spread like players and may switch when spread gives good results.

---

## 11. Summary and Implementation Priorities

### Core Implementation Order

1. **Technology Data Structures**: Define technology types, era definitions, prerequisites, and unlock relationships.

2. **Innovation Generation**: Implement base innovation generation with universities, capacity scaling, and bonuses.

3. **Research Queue**: Implement single-technology research and queue system.

4. **Technology Requirements**: Implement prerequisite checking and availability.

5. **Research Speed**: Implement bonuses and penalties affecting research rate.

6. **Technology Spread**: Implement passive spread system.

7. **University Effects**: Implement institution connections.

8. **Unlock System**: Implement building, PM, and law unlock integration.

9. **Trade and Literacy Integration**: Implement secondary effects on research.

10. **AI Research**: Implement AI prioritization and difficulty.

### Key Formulas Summary

**Innovation Capacity**: 50 + (literacyRate × 1.5) + bonuses

**Era Cost**: eraCost + (unresearchedCount × eraDifference × 0.25 × eraCost)

**Technology Spread**: 25 + (literacyRate × 0.2) + convertedExcessInnovation

**Tech Cost Example**: An Era 4 technology (15000 cost) with 3 unresearched Era 2 techs and era difference 2 gets penalty of `3 × 2 × 0.25 × 15000 = 2250`, total cost 17250.

### Design Principles

1. **Innovation Should Be Scarce**: Research should take meaningful time; cannot rush through all tech trees quickly.

2. **Strategic Tradeoffs**: Player decisions about what to research should matter significantly.

3. **Unlock-Driven Gameplay**: Technologies should primarily unlock new possibilities rather than providing pure bonuses.

4. **Passive Progress as Safety Net**: Technology spread prevents players from falling hopelessly behind.

5. **Connections Between Systems**: Research should affect and be affected by many game systems, creating depth.

6. **Clear Player Feedback**: Players should always know why they can or cannot research particular technologies.