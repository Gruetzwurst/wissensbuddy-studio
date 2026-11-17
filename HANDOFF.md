# HANDOFF – Wissensbuddy Studio (Stand 16.11.2026)

## Stand und GitHub-Version
- Letzter in diesem Chat wiedergefundener vollständiger Prototyp: **v8 iPhone-Fix**.
- `index.html` im Repository ist die v8-Einzeldatei (Quellcode mit teils eingebetteten Medien).
- Die **Originaldateien und Referenzen** liegen zusätzlich im Übergabe-ZIP `Wissensbuddy-Codex-Handoff-v8-complete.zip` aus dem Chat. Nicht verwechseln: Dieses ZIP ist bislang **nicht im Repository gespeichert**.
- Neben dem HTML existieren 15 angeforderte Einzelassets, zwei weitere Prototyp-Grafiken, freigegebene Referenzen, eine WAV-Testdatei und Demo-Lip-Sync-Daten. Die Binärdateien sind Bestandteil des Chat-ZIPs, aber noch **nicht als separate GitHub-Dateien hochgeladen**.

## Tatsächlich vorhandene Funktionen
- Mobile-first grün/weißes Studio-Layout mit Thema, Szenenliste, Posenleiste, Canvas-Hochkantvorschau.
- Wombat-Pilotszenen, einzelne Szenentexte, Hintergrund-/Bildzuweisung.
- Wiederverwendeter Ganzkörper im Video; Posen derzeit teilweise nur als Gestenindikatoren.
- `front.png` mit ursprünglichem Mund als Ruhepose; `front_nomouth.png` als mundlose Körperbasis für Canvas-Mundform beim Sprechen.
- Test-WAV ca. 6,85 Sekunden und Demo-Cues in v8 eingebettet; separate Kopien im ZIP.
- Browserabhängige MediaRecorder-Exportfunktion; **kein bestätigter iPhone-MP4-Export**.

## Bekannte Fehler
1. **Echtes iPhone:** Beim Öffnen des lokalen HTML über ChatGPT/iOS berichtete der Nutzer leere bzw. nicht reagierende Videovorschau und fehlende Funktion von Play und Sprechtest. Ursache nur vermutet (Dateivorschau/JavaScript); **HTTPS-GitHub-Pages-Test noch nicht belegt**.
2. Früher **Doppelmund**, wenn ein neu gezeichneter Mund auf dem alten Sprite-Mund lag. Die v8-Lösung schaltet auf eine mundlose Figur um. Mundposition weiterhin visuell testen.
3. Frühere Posen waren teils nur **Kopf-/Oberkörper-Crops**; der Charakter muss in allen Videoframes vollständig bleiben.
4. Vorheriges dauerhaftes Auf-und-ab-Wippen wurde vom Nutzer ausdrücklich abgelehnt.
5. Niedrige Auflösung der mundlosen Figur (136 × 256 px), keine hochwertige Layer-/SVG-Rig-Datei.
6. Kein geprüfter deutscher automatischer Phonem-Lip-Sync, nur manuelle/Demo-Mund-Cues und einfache Audio-Lautstärke.
7. Eigene Bildhintergründe und Projektspeichern benötigen noch robuste End-to-End-Tests.
8. Prototyp-Wombatbild wirkt KI-generiert; keine geprüfte Originalfoto-Lizenz für diese konkrete Datei.
9. iPhone-Browser-MP4-Export nicht nachgewiesen.

## Nur Platzhalter, nicht fertig
- `Video erstellen` ist bislang eine Vorschau, **kein automatischer Produktions-Workflow**.
- Auswahl der Stimme erzeugt noch keine garantierte deutsche KI-Sprachdatei.
- 28 Demo-Zeitabschnitte sind **nicht** aus der WAV durch Rhubarb analysiert.
- Standardbilder/Schemata, manche Gesten, Untertitel-Timing, Videoexport und TTS sind provisorisch.

## Noch fehlende Originale und Nachweise
- Keine echte Rhubarb-Ausgabe zur vorhandenen WAV.
- Keine exportierte Beispielprojekt-JSON aus dem Editor gefunden.
- Keine separat gespeicherten PNG-Mundformen; Canvas-Code in `index.html`; Referenzextrakt im Chat-ZIP.
- Keine editierbare SVG-/PSD-/Figma-Layerdatei des Wissensbuddy.
- Kein nachweislich lizenzgeprüftes Original der früher diskutierten echten Pixabay-/Unsplash-Wombat-Fotografien.

## Aufgaben an Codex
1. Auf der HTTPS-GitHub-Pages-Website auf echtem iPhone Safari **Play und Sprechtest testen**, Konsole/Fehlerstatus dokumentieren.
2. Alle 15 originalen `assets/`-Dateien plus Referenzen aus dem Chat-ZIP ergänzen; kein Ersatzbild generieren.
3. Originalgetreue mundlose Ganzkörperfigur mit getrennten Mundformen und korrekt kalibrierten Koordinaten nutzen.
4. Automatisierten deutschen Phonem-Lip-Sync aufbauen; Demo-Cues klar als Demo belassen.
5. Eigene echte Bilddateien pro Szene und dokumentierte Lizenzen.
6. Zuverlässige MP4-Ausgabe; keine API-Schlüssel ins öffentliche Repository.

## Designregeln
Die freigegebenen Charakter- und UI-Vorlagen sind verbindlich: weißer Rundkopf, runde schwarze Brille, drei Haarsträhnen, grüner Hoodie, schwarze Hose, weiße Schuhe. Stabile **vollständige Figur**, kein Dauerwippen, **niemals zwei Münder gleichzeitig**. Nutzer möchte nur **eine einfach bedienbare Web-App**, möglichst kostenlos. Pilot: „Warum kacken Wombats Würfel?“

## Übernahme durch Codex (16.11.2026)
Die Originalgrafiken, Demo-Medien und Referenzen aus `wissensbuddy.zip` wurden ergänzt. Bestehende README, HTML und Übergabetexte blieben erhalten. Alle 15 Asset-Verweise sind lokal vorhanden; JavaScript-Syntaxprüfung mit Node erfolgreich. 29 Medien-/Referenzdateien stimmen bytegleich mit dem ZIP überein.

Ein neuer funktionaler Browser- oder Audiotest wurde nicht durchgeführt: Hier ist kein Browser verfügbar; der Download des Testbrowsers wurde abgelehnt. Echtes iPhone Safari, HTTPS-Wiedergabe und Videoexport bleiben ungeprüft.

## Foto-/Tonvorlage: Umsetzung vom 16.11.2026
Eine durchgehende Aufnahme bestimmt jetzt die Videolänge. Szenen haben editierbare Startzeiten in Sekunden; Fotos und Szenen lassen sich hinzufügen und entfernen. Die Projektdatei Version 5 enthält die Tonspur, Bilder, Startzeiten, Textoptionen und importierte Munddaten. Alte Projekte der Version 4 werden migriert. Ungültige Dateien ersetzen den vorhandenen Stand nicht. Fotos werden für die Vorlage auf maximal 1600 Pixel Kantenlänge verkleinert; die Originaldateien bleiben unverändert.

Grenzen: Audio bis 40 MB / 10 Minuten, Einzelbild bis 20 MB, Projektdatei bis 100 MB, maximal 200 Szenen. Verarbeitung im Browser. Es gibt keinen neuen externen Dienst. Automatische Lauterkennung bleibt nach der Entscheidung, ohne Downloads weiterzuarbeiten, offen. Siehe `docs/lipsync-feasibility.md` und `docs/acceptance.md` für Nachweise und Einschränkungen.

## Mundkorrektur (17.11.2026)
Der sichtbare Mund stammt jetzt aus der Originalfigur. Nur seine ursprüngliche Fläche wird animiert; die großflächige alte Gesichtsabdeckung und die darüber gezeichneten Fremdformen werden nicht mehr verwendet. Die Basis wird im Browser aufgebaut, ohne die Originaldateien zu verändern. Firefox-Pixeltests prüfen unveränderte Gesichtspixel außerhalb der Mundfläche und die Begrenzung aller Mundvarianten auf die ursprüngliche Fläche. Die Lautanalyse bleibt unverändert offen.
