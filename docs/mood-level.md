# Lustlevel-System: Benutzerhandbuch

## Überblick

Das Lustlevel-System zeigt an, wie hoch die aktuelle "Lustbereitschaft" basierend auf dem letzten Auftrag ist. Mit steigender Zeit seit dem letzten Auftrag steigt automatisch das angezeigte Level. Als Administrator kannst du dieses Level auch manuell steuern.

## Funktionsweise

### Automatische Berechnung

Das System berechnet das Lustlevel automatisch basierend auf der Zeit seit dem letzten Auftrag:

- **Level 0 (😐)**: 0-3 Tage seit dem letzten Auftrag
- **Level 1 (😉)**: 3-4 Tage seit dem letzten Auftrag
- **Level 2 (🥵)**: 4-6 Tage seit dem letzten Auftrag
- **Level 3 (🔥)**: 6-8 Tage seit dem letzten Auftrag
- **Level 4 (🍆)**: Mehr als 8 Tage seit dem letzten Auftrag

### Anzeigekomponente (MoodTachometer)

Der MoodTachometer zeigt Benutzern:

- Das aktuelle Lustlevel mit Emojis
- Eine Beschreibung des Zustands
- Konkrete Verhaltenstipps je nach Level
- Optional einen Hinweis, wenn das Level manuell eingestellt wurde

## Admin-Funktionen

Als Administrator hast du über das Admin-Dashboard Zugriff auf die Steuerung des Lustlevels. Du findest diese Funktion im Admin-Dashboard unter "Lustsensor".

### Möglichkeiten zur Steuerung

Du hast zwei grundlegende Möglichkeiten, das Lustlevel zu beeinflussen:

#### 1. Manuelle Überschreibung

Bei dieser Option wird das automatisch berechnete Level überschrieben und stattdessen dein manuell eingestelltes Level angezeigt.

- **Vorteile**: Präzise Kontrolle über das angezeigte Level
- **Nachteile**: Das Level bleibt statisch, bis die Überschreibung entfernt wird oder abläuft

Für eine manuelle Überschreibung:

1. Wähle das gewünschte Level (0-4) mit dem Schieberegler
2. Stelle sicher, dass "Datum anpassen statt manuelle Überschreibung" NICHT aktiviert ist
3. Wähle optional eine Ablaufzeit:
   - Kein Ablaufdatum (bleibt aktiv bis zum manuellen Zurücksetzen)
   - Nach X Stunden zurücksetzen
   - Zu einem bestimmten Zeitpunkt zurücksetzen
4. Klicke auf "Manuelles Level speichern"

#### 2. Datumsanpassung (empfohlen)

Diese Option passt das Datum des letzten Auftrags so an, dass es zum gewünschten Level führt. Das Level wird dann von diesem Punkt an wieder natürlich mit der Zeit steigen.

- **Vorteile**: Das Level steigt weiterhin natürlich mit der Zeit
- **Empfohlen für**: Die meisten Anwendungsfälle, besonders wenn das Level mit der Zeit steigen soll

Für eine Datumsanpassung:

1. Wähle das gewünschte Level (0-4) mit dem Schieberegler
2. Aktiviere "Datum anpassen statt manuelle Überschreibung"
3. Klicke auf "Datum anpassen & Level setzen"

### Zurücksetzen der Einstellungen

Du hast zwei Möglichkeiten zum Zurücksetzen:

1. **Manuelle Einstellung zurücksetzen**: Entfernt nur die manuelle Überschreibung und kehrt zur automatischen Berechnung zurück
2. **Neuen Auftrag simulieren**: Setzt das Level auf 0, als ob gerade ein neuer Auftrag abgeschlossen wurde

## Praktische Anwendungsbeispiele

### Beispiel 1: Lustlevel erhöhen

Du möchtest das Lustlevel auf 3 (🔥) setzen und es soll von dort langsam weiter steigen:

1. Wähle Level 3 mit dem Schieberegler
2. Aktiviere "Datum anpassen statt manuelle Überschreibung"
3. Klicke auf "Datum anpassen & Level setzen"
4. Das System berechnet automatisch, wie viele Tage vergangen sein müssten, und setzt das Datum entsprechend

### Beispiel 2: Lustlevel temporär festlegen

Du möchtest das Lustlevel für genau 24 Stunden auf 4 (🍆) setzen:

1. Wähle Level 4 mit dem Schieberegler
2. Deaktiviere "Datum anpassen statt manuelle Überschreibung"
3. Wähle "Nach Stunden zurücksetzen" und stelle 24 Stunden ein
4. Klicke auf "Manuelles Level speichern"

### Beispiel 3: Lustlevel zurücksetzen

Nach einem Auftrag möchtest du das Lustlevel auf 0 zurücksetzen:

1. Klicke auf "Neuen Auftrag simulieren"
2. Das System erstellt einen neuen Auftragseintrag mit dem aktuellen Datum

## Tipps für die optimale Nutzung

- **Für kontinuierliches Steigen**: Nutze die "Datum anpassen"-Option, damit das Level mit der Zeit weiter steigt
- **Für temporäre Einstellungen**: Nutze die manuelle Überschreibung mit Ablaufzeit
- **Für Zurücksetzen nach Aufträgen**: Klicke auf "Neuen Auftrag simulieren"
- **Zum Testen verschiedener Level**: Probiere die verschiedenen Modi aus, um zu sehen, welche am besten für deine Bedürfnisse funktionieren

## Fehlerbehebung

- **Level ändert sich nicht sofort**: Aktualisiere die Seite oder warte einige Sekunden
- **Überschreibung verschwindet nicht**: Prüfe, ob die Ablaufzeit korrekt eingestellt wurde
- **Generator-Datum wird nicht aktualisiert**: Stelle sicher, dass du auf "Datum anpassen & Level setzen" geklickt hast

Diese Dokumentation hilft dir, das Lustlevel-System effektiv zu steuern und zu nutzen.
