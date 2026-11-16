# Wissensbuddy Studio 🤓💚

**Wissensbuddy Studio** ist ein mobiles, möglichst kostenloses Werkzeug zum Erstellen kurzer deutschsprachiger Wissensvideos im Hochkantformat **9:16**. Der wiederkehrende Moderator **Wissensbuddy** ist ein kleiner Cartoon-Nerd mit weißem rundem Kopf, großen runden schwarzen Brillengläsern, drei Haarsträhnen, grünem Hoodie, dunkler Hose und weißen Sneakern.

## Ziel

Ein Thema eingeben, Skript prüfen, passende Bilder pro Szene auswählen, freundliche deutsche Stimme einfügen bzw. später automatisch erzeugen, die Mundbewegungen des Moderators synchronisieren und ein fertiges Short exportieren. Das alles soll über **eine einzige Webanwendung** (auch auf dem iPhone) laufen – keine drei verschiedenen Programme.

**Pilotfolge:** „Warum kacken Wombats Würfel?“ — Erzählstil: locker und humorvoll; Stimme: freundlich, männlich.

## Design – unbedingt einhalten

- Grafische Leitvorlage ist das freigegebene **Wissensbuddy-Charakterblatt** aus dem Entwicklungsprojekt, nicht eine eigenständig generierte alternative Figur.
- **Immer die vollständige Figur zeigen**, niemals im Szenenwechsel auf einen isolierten Kopf oder Halbfigur wechseln.
- **Keine dauerhafte Auf-und-ab-Bewegung** des Charakters. Ruhiger Stand, sparsame Gesten und gelegentliches Blinzeln.
- Eine **mundlose Ganzkörper-Basisgrafik** plus separate animierbare Mundformen. Niemals einen animierten Mund auf einen bereits eingezeichneten Originalmund legen – das erzeugte in früheren Versionen einen sichtbaren Doppelmund.
- Für echten Lip-Sync: phonem-/visembasierte Mund-Cues mit Zeitstempeln; für einen technischen Test können Lautstärke und Timing vereinfacht werden. Präziser deutscher Lip-Sync ist noch ausstehend.
- Oberfläche möglichst nahe am freigegebenen Mockup: dunkelgrüne Seitenleiste, „Thema“, „Stil & Stimme“, „Video-Optionen“, zentrale Hochkant-Vorschau, Szenenliste rechts und Posenleiste unten.

## Gewünschter Bedienablauf

1. Thema und Sprechertext festlegen.
2. Szenen automatisch vorschlagen und **jede Szene separat bearbeiten** (Titel, Untertitel, Foto, optional Pose).
3. Eigene oder individuell **lizenzgeprüfte echte Fotos** hochladen; ausdrücklich keine künstlich wirkenden Standard-Wombat- oder Kotdarstellungen.
4. Sprecheraufnahme hochladen bzw. später automatisch TTS erzeugen.
5. Mundbewegungen zum gesprochenen Ton synchronisieren.
6. Video in 9:16 ansehen und als MP4 ausgeben.

## Status (November 2026)

Eine Reihe lokaler Browser-Prototypen **v1–v8** wurde erstellt. Sie enthalten verschiedene Zwischenstände: Szenenlayout, Pose-Auswahl, Einzelbild-Uploads, Projekt speichern/laden, Ganzkörperdarstellung, Basis-Mundanimation sowie einen Testton. Die letzte lokale Variante ist **Wissensbuddy Studio v8 – iPhone-Fix**.

**Wichtig: Diese Prototypen sind noch keine fertige Produktionslösung.** Insbesondere beim Öffnen der lokalen HTML-Datei über die iPhone-/ChatGPT-Dateivorschau blieb die Videofläche trotz mehrerer Fixes leer. Das war der Grund für die Entscheidung, GitHub Pages als normale HTTPS-Seite zu testen.

Im Repository sollen daher zunächst eine iPhone-freundliche Web-Version und die Projektdokumentation liegen. Die getesteten lokalen Dateien liegen als ZIP im bisherigen Chat und sind nicht automatisch Teil dieses Repositories.

### Funktional / in Prototypen vorhanden

- Grundlayout in grüner Wissensbuddy-Gestaltung
- Szenen für die Wombat-Pilotfolge
- Hochkant-Canvas-Vorschau im Browser (Desktop)
- Bild-Upload pro Szene (in späterer lokaler Beta)
- Grundlegender Wechsel von Mundformen
- Import von Rhubarb-Mund-Zeitdaten (in späterer lokaler Beta)
- Browserabhängiger Videoexport

### Noch offen

- Sicherer Nachweis, dass Vorschau und Sprechtest auf einem **echten iPhone in Safari per HTTPS** laufen
- Originalgetreues, transparent freigestelltes, mundloses **hochwertiges Master-Sprite**
- Verlässliche deutsche TTS-Generierung mit kommerziellen Nutzungsrechten
- Vollautomatische deutsche Visem-/Phonemerkennung aus der Tonspur
- Robuster **MP4-Export** auf iPhone (wahrscheinlich serverseitig)
- Wiederverwendbare und rechtlich dokumentierte Medienbibliothek
- Echte inhaltliche Prüfung jedes Shorts und seiner Quellen vor Veröffentlichung

## Wissenschaftliche Grundlage der Pilotfolge

Yang, P. J., et al. (2021): *Intestines of non-uniform stiffness mold the corners of wombat feces*. **Soft Matter** 17, 475–488. DOI: https://doi.org/10.1039/D0SM01230K.

Die würfelige Form entsteht im Darm. Der vermutete Nutzen des geringeren Wegrollens bei Reviermarkierungen ist als möglicher Vorteil, nicht als abschließend bewiesene evolutionäre Ursache, zu formulieren.

## Urheberrecht und Datenschutz

- Keine Bilder einfach aus einer Google-Bildersuche übernehmen.
- Für jedes verwendete Foto Original-URL, Urheber, **kommerzielle Nutzungserlaubnis** und Lizenzstand festhalten.
- Wikimedia Commons CC0/PD/CC BY oder individuell geprüfte Pixabay-/Unsplash-Medien können infrage kommen; Einschränkungen pro Bild prüfen.
- Sprecher-Audio und Bildmaterial dürfen nur mit ausreichenden Rechten hochgeladen und veröffentlicht werden.
- **Keine API-Schlüssel ins GitHub-Repository oder in öffentlich ausgeliefertes JavaScript eintragen.**
- Falls TTS/Rendering externe Dienste nutzt, über geschützte Backend-Funktionen.

## Architektur – Zielbild

- Frontend: mobile-first Web-App (HTML/CSS/JavaScript oder React/TypeScript)
- Animationsfigur: echte separate Sprites oder SVG-Layer
- Vorschau: Canvas oder React/Remotion
- Sprache: deutsche TTS mit wählbarer freundlicher Stimme
- Lip-Sync: Rhubarb Lip Sync / geeignete deutsche Phonem-Timings, als JSON-Mund-Cues
- Rendern: reproduzierbare Timeline; mittelfristig Remotion/FFmpeg serverseitig
- GitHub Pages: statisches Frontend **öffentlich**
- Keine unnötigen Abos; 1–2 Shorts pro Woche als Nutzungsszenario

## Für Codex – Arbeitsprioritäten

1. Auf GitHub Pages lauffähige **iPhone-Vorschau** mit überprüfbarem Play und Sprechtest.
2. Die echte Wissensbuddy-Figur konsistent als **Ganzkörper ohne fest eingezeichneten Mund**; getrennte Mundformen.
3. Pro-Szene-Bearbeitung und Originalbildimport mit lokal gespeichertem Projekt.
4. Audioimport und präziserer Lip-Sync.
5. Zuverlässiger MP4-Export und später ein Ein-Klick-Workflow.

**Nicht** die alte KI-Illustration des Wombats oder Kotwürfel auf Steinen als echtes Bildmaterial ausgeben. **Nicht** das Projekt als fertig deklarieren, solange die iPhone-Vorschau oder der Export scheitern.
