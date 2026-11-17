# Mundformen und Koordinaten – v8

Die vorhandene v8-HTML enthält **keine separaten PNG-/SVG-Mundformen**. Sie zeichnet die Formen zur Laufzeit im Canvas über `drawMouth(g, shape, mx, my)`.

- Unterstützte Zeichenwerte: `X`, `A`, `B`, `C`, `D`, `E`, `F`. Nicht jede Form entspricht einem exakten deutschen Phonem.
- `X` / `A`: schmaler geschlossener Bogen, ca. 18 px breit und 7 px tief.
- `B`: Ellipse, Halbachsen ca. 10×5 px.
- `C`: mittlere offene Ellipse, ca. 11×9 px, Zunge.
- `D`: größere Öffnung, ca. 10×14 px, Zunge.
- `E`: schmale hohe O-Form, ca. 7×13 px.
- `F`: siehe Originalfunktion `drawMouth` in `index.html`.
- Ursprünglicher Canvas: 1080×1920 px. Im `drawBuddy` gilt `baseX=303`, `baseY=1250`, `sc=3.15`.
- Aufruf `drawMouth(g, shape, 8, -40)` **nach** Translation und Skalierung: Das sind lokale transformierte Koordinaten.
- Im Ruhezustand `front.png`; bei Sprachwiedergabe `front_nomouth.png` plus **eine** Mundzeichnung.
- `demo/beispiel-mouth-cues-NICHT-RHUBARB.json` im Handoff-ZIP enthält 28 Demoabschnitte, **keinen echten Rhubarb-Lip-Sync**.

Der Doppelmund-Fehler entstand, wenn zusätzlich ein Mund über dem bereits gezeichneten Originalmund lag. **Nicht** mit weiterer Übermalung beheben, sondern die mundlose Basis benutzen.

## Foto-/Tonvorlage (neuer Stand)
Die Zeichenlogik liegt jetzt in `studio/app.js`. Sie verwendet die mundlose Ganzkörperbasis auch im Ruhezustand und zeichnet dann die geschlossene Form X. Damit bleibt kein offen gezeichneter Originalmund nach dem Stoppen stehen. H bleibt als eigenständiger Cue erhalten und wird mit angehobener Zunge dargestellt; importierte Werte werden nicht mehr stillschweigend auf G umgeschrieben.

Munddaten gelten für die beim Import geladene Tonspur. Eine andere Aufnahme verwirft sie; Projektdateien speichern Aufnahme und Cues gemeinsam. Der Sprechtest verwendet getrennte Demo-Daten und löscht die Nutzeraufnahme nicht. Automatische Analyse ist noch nicht integriert; ohne Cues ist die Animation lautstärkebasiert.
