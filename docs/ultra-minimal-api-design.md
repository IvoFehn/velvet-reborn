# Ultra-Minimale API Struktur

## Aktueller Zustand: 50+ API Dateien
- 23 Ordner mit ~40+ Dateien
- 10 einzelne API-Dateien  
- Massive Redundanz und Fragmentierung

## Neue Struktur: Nur 5 API-Dateien

```
pages/api/
├── user.ts         # Alle Benutzer-bezogenen Operationen
├── content.ts      # Alle Content-Management Operationen  
├── gaming.ts       # Alle Gaming/Belohnungs-Operationen
├── system.ts       # System-Funktionen und Konfiguration
└── webhooks.ts     # Externe Integrationen (Telegram, etc.)
```

## Endpunkt-Konsolidierung

### **user.ts** - Benutzer & Profile Management
```typescript
// Profile Operations
GET    /api/user?action=profile
PUT    /api/user?action=profile
GET    /api/user?action=inventory
PUT    /api/user?action=inventory&item=:id
GET    /api/user?action=stats
PUT    /api/user?action=stats

// Authentication & Login
POST   /api/user?action=login
POST   /api/user?action=daily-login
POST   /api/user?action=logout
```

### **content.ts** - Content & Data Management
```typescript
// Sanctions
GET    /api/content?type=sanctions&status=:status
POST   /api/content?type=sanctions&action=create
PUT    /api/content?type=sanctions&id=:id&action=complete
DELETE /api/content?type=sanctions&id=:id

// Events  
GET    /api/content?type=events&active=:bool
POST   /api/content?type=events
PUT    /api/content?type=events&id=:id

// Tasks
GET    /api/content?type=tasks&completed=:bool
POST   /api/content?type=tasks
PUT    /api/content?type=tasks&id=:id&action=toggle

// News, Wiki, Surveys
GET    /api/content?type=news
GET    /api/content?type=wiki&id=:id
POST   /api/content?type=survey&action=submit

// Tickets
GET    /api/content?type=tickets&status=:status
POST   /api/content?type=tickets
PUT    /api/content?type=tickets&id=:id
```

### **gaming.ts** - Gaming & Rewards System
```typescript
// Shopping & Economy
GET    /api/gaming?action=shop&category=:category
POST   /api/gaming?action=purchase&item=:id

// Coins & Rewards
GET    /api/gaming?action=coinbook
POST   /api/gaming?action=spin
POST   /api/gaming?action=lootbox&id=:id

// Level & Progress
GET    /api/gaming?action=levels
PUT    /api/gaming?action=levels  
GET    /api/gaming?action=weights
PUT    /api/gaming?action=weights

// Generator
GET    /api/gaming?action=generator
POST   /api/gaming?action=generator&action=accept
POST   /api/gaming?action=generator&action=reset
```

### **system.ts** - System & Configuration
```typescript
// Mood System
GET    /api/system?module=mood&action=current
POST   /api/system?module=mood&action=submit
POST   /api/system?module=mood&action=reset

// Warnings
GET    /api/system?module=warnings
POST   /api/system?module=warnings&action=create
PUT    /api/system?module=warnings&id=:id&action=acknowledge

// Configuration
GET    /api/system?module=config&type=thresholds
PUT    /api/system?module=config&type=thresholds
GET    /api/system?module=config&type=weights
PUT    /api/system?module=config&type=weights

// Admin Functions
POST   /api/system?action=bulk-complete&type=sanctions
POST   /api/system?action=check&type=sanctions
```

### **webhooks.ts** - External Integrations
```typescript
// Telegram Integration
POST   /api/webhooks?service=telegram
POST   /api/webhooks?service=telegram&action=send

// Other External Services  
POST   /api/webhooks?service=:service&action=:action
```

## URL Pattern Standard
```typescript
// Base Pattern
/api/{module}?{parameters}

// Examples
/api/user?action=profile
/api/content?type=sanctions&status=open&page=1
/api/gaming?action=shop&category=items
/api/system?module=mood&action=current
/api/webhooks?service=telegram&action=send
```

## Vorteile der neuen Struktur

1. **95% weniger Dateien** (50+ → 5)
2. **Einheitliche Parameter-basierte Routing**
3. **Klare funktionale Gruppierung**  
4. **Einfache Erweiterbarkeit**
5. **Reduzierte Komplexität**
6. **Bessere Übersichtlichkeit**

## Implementation Strategy

Jede Datei implementiert:
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  
  // Route based on query parameters
  switch (query.action || query.type) {
    case 'profile': return handleProfile(req, res);
    case 'sanctions': return handleSanctions(req, res);
    // etc.
  }
}
```

Diese Struktur reduziert die API von 50+ Dateien auf nur 5 übersichtliche, gut organisierte Module.