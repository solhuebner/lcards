# Architecture Overview

> **LCARdS System Architecture**
> High-level overview of the singleton-based rendering system, card types, and component relationships.

---

## 🎯 Core Philosophy

LCARdS is a Home Assistant custom card system built on a **singleton-based, data-driven architecture** that supports multiple card instances with shared resources.

**Key Principle:** Shared intelligence, distributed presentation.
- Global singleton systems (RulesEngine, DataSourceManager, ThemeManager) provide shared intelligence
- Individual cards focus solely on presentation and user interaction
- Entity caching provides 80-90% faster access with multiple cards

---

## 🏗️ Card Architecture

LCARdS provides two card foundation types, both built on a common base:

```
LitElement (Lit web component)
    ↓
LCARdSNativeCard (HA integration, shadow DOM, actions)
    ↓
    ├─→ LCARdSSimpleCard → Simple Cards (SimpleButton, etc.)
    │   • Lightweight, single-purpose cards
    │   • Direct singleton integration
    │   • Template processing & action handling
    │   • **Go-forward architecture** ⭐
    │
    └─→ LCARdSMSDCard → MSD Cards
        • Multi-overlay complex displays
        • Advanced rendering pipeline
        • Navigation & routing
        • **Future: Will be refactored to use Simple Cards for overlays**
```

### Current State

- ✅ **SimpleCard Foundation**: New, clean architecture - all new cards use this
- ✅ **SimpleButton Card**: First production Simple Card (v1.14+)
- ⏳ **MSD Cards**: Current implementation, will be refactored to leverage Simple Cards

**See:** [Simple Card Foundation](simple-card-foundation.md) for details on the go-forward architecture.

---

## 🎨 Architecture Layers

```mermaid
graph TB
    subgraph "Home Assistant Layer"
        HA[Home Assistant Core]
        HASS[hass Object]
    end

    subgraph "LCARdS Global Singleton Layer"
        LC[lcardsCore]

        subgraph "BaseService Architecture"
            BS["⭐ BaseService
            updateHass() and ingestHass()"]
        end

        subgraph "Shared Intelligence Systems"
            RE["🧠 RulesEngine
            extends BaseService"]
            DSM["📊 DataSourceManager
            extends BaseService"]
            TM["🎨 ThemeManager
            extends BaseService"]
            AM["🎬 AnimationManager
            extends BaseService"]
            SPM["🎭 StylePresetManager
            extends BaseService"]
            AR[🗂️ AnimationRegistry]
            VS[✅ ValidationService<br/>extends BaseService]
            SL[📚 StyleLibrary]
            CSM[⚙️ CoreSystemsManager<br/>extends BaseService]
        end
    end

    subgraph "Card Instance Layer"
        subgraph "MSD Card A"
            CardA[MSD Card Element A]
            SMA[Systems Manager A]
            RendererA[Advanced Renderer A]
            OIA[Overlay Instances A]
        end

        subgraph "MSD Card B"
            CardB[MSD Card Element B]
            SMB[Systems Manager B]
            RendererB[Advanced Renderer B]
            OIB[Overlay Instances B]
        end

        subgraph "SimpleButton Card"
            CardC[SimpleButton Card]
            SimpleC[Direct Rendering]
        end
    end

    subgraph "Output Layer"
        SVGA[SVG Container A]
        DOMA[HTML Elements A]
        SVGB[SVG Container B]
        DOMB[HTML Elements B]
        DOMC[HTML Elements C]
    end

    %% BaseService inheritance hierarchy
    BS -.inherits.-> RE
    BS -.inherits.-> DSM
    BS -.inherits.-> TM
    BS -.inherits.-> AM
    BS -.inherits.-> SPM
    BS -.inherits.-> VS
    BS -.inherits.-> CSM

    %% Home Assistant to Singletons
    HA --> HASS
    HASS --> LC
    LC --> RE
    LC --> DSM
    LC --> TM

    %% Singletons serve all cards
    RE -.rule results.-> SMA
    RE -.rule results.-> SMB
    RE -.rule results.-> CardC
    DSM -.entity data.-> SMA
    DSM -.entity data.-> SMB
    TM -.themes.-> RendererA
    TM -.themes.-> RendererB
    TM -.themes.-> SimpleC
    AM -.animations.-> RendererA
    AM -.animations.-> RendererB

    %% Card instance flows
    CardA --> SMA --> RendererA --> OIA --> SVGA
    CardB --> SMB --> RendererB --> OIB --> SVGB
    CardC --> SimpleC --> DOMC
    OIA --> DOMA
    OIB --> DOMB

    %% Multi-directional rule registration
    SMA -.registers rules.-> RE
    SMB -.registers rules.-> RE
    CardC -.registers overlays.-> RE

    classDef baseservice fill:#f9ef97,stroke:#ac943b,stroke-width:3px,color:#0c2a15
    classDef singleton fill:#b8e0c1,stroke:#266239,stroke-width:2px,color:#0c2a15
    classDef card fill:#80bb93,stroke:#083717,stroke-width:2px,color:#0c2a15
    classDef simplecard fill:#458359,stroke:#095320,stroke-width:2px,color:#f3f4f7

    class BS baseservice
    class RE,DSM,TM,AM,SPM,AR,VS,SL,CSM singleton
    class CardA,SMA,RendererA,CardB,SMB,RendererB card
    class CardC,SimpleC simplecard
```

**Layers:**
1. **Home Assistant Layer** - Provides `hass` object with entity states
2. **Singleton Layer** - Shared intelligence systems (rules, data, themes)
3. **Card Instance Layer** - Individual card instances with their rendering
4. **Output Layer** - Final SVG/HTML output to shadow DOM

---

## 🔑 Key Concepts

### Singleton Systems
All intelligence is shared across card instances:
- **RulesEngine** - Conditional logic evaluation
- **DataSourceManager** - Entity subscriptions and data processing (MSD cards)
- **CoreSystemsManager** - Entity caching (Simple Cards)
- **ThemeManager** - Color schemes and styling
- **AnimationManager** - Animation coordination

**See:** [Core Components](core-components.md) for detailed singleton documentation.

### BaseService Pattern
Most singletons extend `BaseService` for consistent lifecycle:
- `updateHass(hass)` - Receive new `hass` object from Home Assistant
- `ingestHass()` - Process and react to hass updates
- Guaranteed lifecycle methods eliminate runtime type checking

### Multi-Card Coordination
- Multiple MSD or Simple cards can coexist on same dashboard
- Singletons provide consistent behavior across all cards
- Entity subscriptions shared (no duplicate subscriptions)
- Rules can target overlays across cards

---

## 📚 Detailed Documentation

### Architecture Details
- **[Core Components](core-components.md)** - All singleton systems explained
- **[Rendering Pipeline](rendering-pipeline.md)** - How MSD cards render overlays
- **[Data Flow](data-flow.md)** - Entity data processing pipeline
- **[Multi-Card Architecture](multi-card-architecture.md)** - Cross-card coordination
- **[Design Patterns](design-patterns.md)** - Key architectural patterns

### Card Types
- **[Simple Card Foundation](simple-card-foundation.md)** ⭐ Go-forward architecture
- **[MSD Flow Diagrams](diagrams/)** - MSD initialization and rendering

### Systems
- **[Subsystems](subsystems/)** - Detailed docs for each singleton
- **[Schemas](schemas/)** - Configuration schemas
- **[API Reference](api/)** - Runtime and debug APIs

---

**Last Updated:** November 22, 2025
**Status:** Current - reflects singleton architecture with Simple Card foundation
