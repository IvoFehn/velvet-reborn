# API Redesign nach Zalando Guidelines

## Aktuelle Probleme
- **52 Endpunkte** in inkonsistenter Struktur
- Vermischung von REST und RPC-Patterns
- Fragmentierte Ressourcen-Operationen
- Keine einheitlichen Response-Formate

## Neue REST-konforme Struktur

### 1. Core Resources (Standard CRUD)

#### Profiles
```
GET    /api/profiles           # List profiles (admin)
POST   /api/profiles           # Create profile
GET    /api/profiles/me        # Get current user profile
PUT    /api/profiles/me        # Update current user profile
```

#### Sanctions
```
GET    /api/sanctions          # List sanctions (?status=open&category=sport)
POST   /api/sanctions          # Create sanction
GET    /api/sanctions/{id}     # Get sanction
PUT    /api/sanctions/{id}     # Update sanction
DELETE /api/sanctions/{id}     # Delete sanction
```

#### Events
```
GET    /api/events             # List events (?active=true&from=2024-01-01)
POST   /api/events             # Create event
GET    /api/events/{id}        # Get event
PUT    /api/events/{id}        # Update event
DELETE /api/events/{id}        # Delete event
```

#### Tasks
```
GET    /api/tasks              # List tasks (?completed=false&type=daily)
POST   /api/tasks              # Create task
GET    /api/tasks/{id}         # Get task
PUT    /api/tasks/{id}         # Update task
DELETE /api/tasks/{id}         # Delete task
```

#### Tickets
```
GET    /api/tickets            # List tickets (?status=open&priority=high)
POST   /api/tickets            # Create ticket
GET    /api/tickets/{id}       # Get ticket
PUT    /api/tickets/{id}       # Update ticket
DELETE /api/tickets/{id}       # Delete ticket
```

### 2. Sub-Resources

#### Profile Inventory
```
GET    /api/profiles/me/inventory     # Get inventory
POST   /api/profiles/me/inventory     # Add item to inventory
PUT    /api/profiles/me/inventory/{itemId}  # Use/update inventory item
DELETE /api/profiles/me/inventory/{itemId}  # Remove inventory item
```

#### Ticket Messages
```
GET    /api/tickets/{id}/messages     # Get ticket messages
POST   /api/tickets/{id}/messages     # Add message to ticket
```

#### Profile Stats
```
GET    /api/profiles/me/stats         # Get profile statistics
PUT    /api/profiles/me/stats         # Update stats (admin only)
```

### 3. Action Endpoints (Non-CRUD Operations)

#### Sanction Actions
```
POST   /api/sanctions/{id}/complete   # Complete sanction
POST   /api/sanctions/{id}/escalate   # Escalate sanction
POST   /api/sanctions/bulk-complete   # Complete multiple sanctions
POST   /api/sanctions/check           # Check for expired sanctions
```

#### Task Actions
```
POST   /api/tasks/{id}/complete       # Complete/toggle task
POST   /api/tasks/bulk-complete       # Complete multiple tasks
```

#### Profile Actions
```
POST   /api/profiles/me/daily-login   # Claim daily login
POST   /api/profiles/me/lootbox       # Open lootbox
POST   /api/profiles/me/spin          # Spin wheel
```

#### Shopping
```
POST   /api/shop/purchase             # Purchase item
GET    /api/shop/items                # Get shop items
```

#### System Actions
```
POST   /api/mood/submit               # Submit mood entry
GET    /api/mood/current              # Get current mood
POST   /api/mood/reset                # Reset mood (admin)
POST   /api/notifications/send        # Send notification
```

### 4. Configuration Endpoints
```
GET    /api/config/level-thresholds   # Get level configuration
PUT    /api/config/level-thresholds   # Update level configuration (admin)
GET    /api/config/gold-weights       # Get gold weight configuration
PUT    /api/config/gold-weights       # Update gold weights (admin)
```

### 5. Content Management
```
GET    /api/wiki                      # List wiki pages
GET    /api/wiki/{id}                 # Get wiki page
POST   /api/wiki                      # Create wiki page (admin)
PUT    /api/wiki/{id}                 # Update wiki page (admin)

GET    /api/news                      # List news
POST   /api/news                      # Create news (admin)

GET    /api/surveys/{id}              # Get survey
POST   /api/surveys/{id}/responses    # Submit survey response
GET    /api/surveys/{id}/status       # Get survey status
```

## Endpunkt-Reduktion
- **Von 52 auf 30 Endpunkte** (-42%)
- Konsolidierung verwandter Operationen
- Einheitliche REST-Patterns
- Klarere Resource-Hierarchien

## Response-Format Standardisierung
```typescript
// Success Response
{
  "data": T,
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "pagination": { "total": 100, "page": 1, "size": 20 },
    "version": "v1"
  }
}

// Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email format"
      }
    ],
    "instance": "/api/profiles",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## HTTP Status Codes (Zalando Standard)
- **200 OK** - Successful GET, PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Invalid request
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation error
- **500 Internal Server Error** - Server error

## Content-Type Standards
- **Request**: `application/json`
- **Response**: `application/json`
- **Special**: `application/problem+json` for errors

## Vorteile der neuen Struktur
1. **Konsistenz** - Einheitliche Patterns
2. **Skalierbarkeit** - Klare Resource-Hierarchien
3. **Wartbarkeit** - Weniger Endpunkte, mehr Logik
4. **Standards** - Zalando REST Guidelines konform
5. **Performance** - Optimierte Datenaggregation