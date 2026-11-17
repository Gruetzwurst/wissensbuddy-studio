# Prüfung der Foto- und Tonvorlage

## Bestanden am 16.11.2026

Mit vorhandenem Firefox 160.0 und geckodriver, lokal über HTTP, ohne zusätzliche Softwaredownloads:

- Eigene Datei über den Audioimport laden: mitgelieferte WAV als Testdatei, erkannte Länge 6,851474 s; Länge der Vorlage wird übernommen.
- PNG über den Bildimport laden, Szene hinzufügen, Wechsel bei 1,5 s einstellen. Ungültigen Start bei 0 s für die zweite Szene zurückweisen.
- Zeitregler steuert die Szene am Wechselzeitpunkt.
- Munddaten-Import (28 manuelle Beispiel-Cues) und Sprechtest verändern die Nutzeraufnahme nicht.
- Projekt über den tatsächlichen Speichern-Handler als JSON erzeugen, neue Vorlage öffnen, Projektdatei mit Audio, Bild und Zeiten wieder importieren.
- Projekt mit beschädigter Bilddatei ablehnen und vorhandenen Stand behalten.
- Neue Aufnahme verwirft alte Munddaten; ungültige Audiodatei ersetzt die vorhandene Aufnahme nicht.
- WebM mit Ton exportieren, exportierten Audiostream im Browser decodieren: 6,8935 s, RMS 0,11896. Exportiertes Video in Firefox abspielen: 1080 × 1920, Wiedergabezeit steigt.
- Keine unbehandelten Seitenfehler während dieser Schritte.

Aufzeichnung des Tests: `tests/browser-smoke.py`; der Test verwendet nur Python-Standardbibliothek, vorhandenen Firefox und geckodriver. Download-Klicks werden ausschließlich im Test abgefangen, damit keine Desktopdialoge entstehen. Testmedien bleiben lokal.

Logikprüfungen: `node --test --test-isolation=none tests/*.test.cjs`.

## Grenzen

Die letzte vollständige Firefox-Prüfung erfolgte vor kleinen Anpassungen an leeren Textfeldern, Szenenbezeichnungen und der direkten Auswahl der Szene anhand der Audiozeit. Ein weiterer Browserlauf wurde vom Nutzer abgelehnt; diese nachfolgenden Änderungen sind nur durch Syntax-/Logikprüfungen abgesichert.

Die Prüfung bestätigt Audio-Wiedergabe und die zeitgesteuerte Verwendung importierter Cues, keine korrekte automatische Lauterkennung oder perfekte deutsche Lippensynchronität. Die F/G-Zeichnungen des ursprünglichen Prototyps sollten vor einem späteren Anspruch auf präzisen Phonem-Lip-Sync noch mit den offiziellen Rhubarb-Mundformen abgeglichen werden.

Kein echtes iPhone-Safari getestet. Schmale Firefox-Fenster (500 px) ersetzen diesen Test nicht. Kein MP4-Nachweis; Firefox lieferte WebM. Export-Abbruch per Stop erzeugt eine verkürzte Aufnahme. Browserstimme wird weiterhin nicht als exportierte Tonspur verwendet.

## Wiederholen

```sh
node --test --test-isolation=none tests/*.test.cjs
python3 tests/browser-smoke.py
```

Der Browserlauf benötigt Berechtigung für lokale Netzwerkverbindungen und das Starten der vorhandenen Snap-Anwendungen. Er installiert nichts. Ports 8765 und 4444 müssen frei sein.

## Nachprüfung der Mundkorrektur am 17.11.2026
Der Regressionstest reproduzierte die Änderung von Gesichtspixeln außerhalb der ursprünglichen Mundfläche und die darüber hinausragende große Mundform. Nach der Korrektur vergleicht er die tatsächlich geladenen Bilder im Canvas: keine geänderten Pixel außerhalb der Mundfläche, keine Mundzeichnung außerhalb des Bereichs x=66..91 / y=77..97. Alle neun Cue-Werte werden auf diesen Bereich geprüft. Original, geschlossen und geöffnet werden zusätzlich als Browser-Canvas-Bild zur Sichtprüfung ausgegeben. Die automatische Sprachanalyse wurde nicht verändert.

Auch der reinweiße Fleck der alten Mundbasis wurde als fehlgeschlagener Pixeltest reproduziert und beseitigt. Die aktuelle Basis verwendet die Hautschattierung aus der Originalfigur. Die vollständige Firefox-Prüfung nach dieser Korrektur bestand: null Pixeländerungen außerhalb des Mundbereichs, alle Mundvarianten innerhalb des Bereichs, Foto-/Audioimport, Projekt-Roundtrip und WebM-Wiedergabe mit Ton. Exportierter Audiostream: 6,9335 s gegenüber 6,851474 s Eingabe. Alle elf Logiktests bestanden ebenfalls.
