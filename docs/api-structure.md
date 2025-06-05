# Neue API-Struktur

## Übersicht

Die API-Struktur wurde vollständig überarbeitet, um eine bessere Organisation, Typsicherheit und Wartbarkeit zu gewährleisten.

## Zentrale API-Client (`lib/api/`)

### Core Client (`lib/api/client.ts`)
- **ApiClient Klasse**: Zentrale HTTP-Client-Implementierung
- **Standardisierte Fehlerbehandlung**: Einheitliche ApiError-Klasse
- **Request/Response-Interceptors**: Automatische Header-Verwaltung
- **Query Parameter Support**: Automatische URL-Parameter-Erstellung
- **AbortController Support**: Anfrage-Stornierung möglich

### API-Module
Jedes Modul exportiert spezifische Funktionen für eine Ressource:

- `lib/api/profile.ts` - Profil-Verwaltung
- `lib/api/sanctions.ts` - Sanktions-System
- `lib/api/events.ts` - Event-Management
- `lib/api/tasks.ts` - Aufgaben-Verwaltung
- `lib/api/mood.ts` - Stimmungs-Tracking
- `lib/api/generator.ts` - Generator-Funktionen
- `lib/api/warnings.ts` - Warnungen
- `lib/api/tickets.ts` - Ticket-System
- `lib/api/surveys.ts` - Umfragen
- `lib/api/quicktasks.ts` - Schnelle Aufgaben
- `lib/api/misc.ts` - Weitere API-Endpoints

### Typisierung (`lib/api/types.ts`)
- **ApiResponse Interface**: Standardisierte Response-Struktur
- **Request Payloads**: Typisierte Eingabedaten
- **Filter Interfaces**: Typisierte Filteroptionen

## React Hooks (`hooks/`)

### Generic Hooks (`hooks/useApi.ts`)
- **useApiCall**: Für GET-Requests mit automatischem Loading/Error State
- **useApiMutation**: Für POST/PUT/DELETE-Requests mit Mutation State

### Ressourcen-spezifische Hooks
- `hooks/useProfile.ts` - Profil-Hooks
- `hooks/useSanctions.ts` - Sanktions-Hooks
- `hooks/useEvents.ts` - Event-Hooks
- `hooks/useTasks.ts` - Task-Hooks

## Verwendung

### Alte Struktur (vorher)
```typescript
// Verschiedene HTTP-Libraries
import axios from 'axios';

const response = await fetch('/api/profile/get');
const axiosResponse = await axios.get('/api/sanctions');

// Inkonsistente Fehlerbehandlung
if (!response.ok) {
  throw new Error('Fehler');
}
```

### Neue Struktur (jetzt)
```typescript
// Einheitlicher API-Client
import { profileApi, sanctionsApi } from '@/lib/api';

// Typisierte Responses
const profileResponse = await profileApi.get();
const sanctionsResponse = await sanctionsApi.list({ status: 'offen' });

// Automatische Fehlerbehandlung
if (!profileResponse.success) {
  console.error(profileResponse.error);
}
```

### React Hook Verwendung
```typescript
// Alte Komponente
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/get');
      const data = await response.json();
      setProfile(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, []);

// Neue Komponente
const { data: profile, loading, error, refetch } = useProfile();
```

## API Response Format

### Standardisiertes Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  totalCount?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

## Fehlerbehandlung

### ApiError Klasse
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Verwendung in Hooks
```typescript
const { data, loading, error, mutate } = useCreateSanction();

try {
  await mutate(sanctionData);
  // Erfolg automatisch behandelt
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  }
}
```

## Migration Guide

### Komponenten-Updates
1. **Import-Statements**: Ersetze direkte fetch/axios calls mit API-Hooks
2. **Loading States**: Nutze Hook-basierte Loading States
3. **Error Handling**: Verwende Hook-basierte Error States
4. **State Management**: Reduziere lokale State-Verwaltung

### Beispiel-Migration
```typescript
// Vorher
const [sanctions, setSanctions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSanctions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sanctions');
      setSanctions(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchSanctions();
}, []);

// Nachher
const { data: sanctions = [], loading, error, refetch } = useSanctions();
```

## Vorteile der neuen Struktur

1. **Typsicherheit**: Vollständig typisierte API-Calls und Responses
2. **Konsistenz**: Einheitliche Patterns für alle API-Calls
3. **Wiederverwendbarkeit**: Hook-basierte API-Calls reduzieren Code-Duplikation
4. **Fehlerbehandlung**: Zentrale und konsistente Fehlerbehandlung
5. **Performance**: Automatisches Caching und Request-Deduplication möglich
6. **Wartbarkeit**: Klare Trennung von API-Logic und UI-Logic
7. **Testing**: Einfacheres Mocking und Testing der API-Calls

## Zukünftige Erweiterungen

1. **React Query Integration**: Für erweiterte Caching-Strategien
2. **Request Interceptors**: Für Authentication und Logging
3. **Retry Logic**: Automatische Wiederholung bei Netzwerkfehlern
4. **Optimistic Updates**: UI-Updates vor Server-Bestätigung
5. **Background Sync**: Offline-Support und Background-Synchronisation