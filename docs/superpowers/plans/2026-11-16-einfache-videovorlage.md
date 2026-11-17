# Einfache Videovorlage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine durchgehende Aufnahme und eigene Fotos in einer Web-App zu einem Wissensbuddy-Video zusammenstellen.

**Architecture:** Vorhandene HTML/Canvas-App weiterverwenden. Kleine, separat testbare Timeline- und Projektfunktionen ergänzen; Audiozeit ist die gemeinsame Zeitbasis. Automatische lautbezogene Munddaten erst nach einer belegten Machbarkeitsprüfung integrieren.

**Tech Stack:** Bestehendes JavaScript, Canvas, Web Audio, Node für Logiktests, vorhandener Firefox/geckodriver für Funktionstests. Keine neuen Downloads in diesem Planungsschritt.

**Spec:** `docs/superpowers/specs/2026-11-16-einfache-videovorlage-design.md`

## Global Constraints
- Keine zusätzlichen Programme, die der Nutzer installieren oder bedienen muss.
- Eine Tonspur bestimmt die Videolänge und die gemeinsame Zeitachse.
- Ruhige Ganzkörperfigur, kein dauerhaftes Wippen und kein Doppelmund.
- Externe Audioübertragung, laufende Kosten und neue Dienste sind noch nicht vereinbart.
- Demo-Cues dürfen nicht als Analyseergebnis ausgegeben werden.
- Bestehende Gestaltung und Originalfigur erhalten; keine Bildsuche oder TTS für diese Ausbaustufe.

## Review Focus
- Ungültige oder nicht decodierbare Aufnahme: verständliche Meldung, bisheriges Projekt bleibt nutzbar (Task 2).
- Tonspurwechsel: alte Munddaten verlieren ihre Gültigkeit (Task 2/3).
- Ungültige Bildwechselzeiten: keine überlappende oder unbestimmte Szenenauswahl (Task 2).
- Projekt mit beschädigten Medien: bestehendes Projekt nicht teilweise überschreiben (Task 3).
- Fehlende Analyse oder Exportunterstützung: keinen fertigen Lip-Sync bzw. MP4-Erfolg behaupten (Task 1/4).

### Task 1: Sprachanalyse technisch belegen
**Files:** Create `docs/lipsync-feasibility.md`; noch kein Produktcode.
**Interfaces:** Gewünschtes Ergebnis `{ audioId, duration, mouthCues: [{start,end,value}], method }`, Werte A–H/X mit expliziter Zuordnung zu den gezeichneten Mundformen.
- [ ] Offizielle Rhubarb-Dokumentation prüfen: https://github.com/DanielSWolf/rhubarb-lip-sync (phonetic recognizer für nicht englische Aufnahmen); vorhandene Werkzeuge zuerst inventarisieren.
- [ ] Browserausführung gegenüber geschütztem Analyse-Server anhand real vorhandener Implementierungen prüfen. Verfügbarkeit, Lizenz, Downloadgröße, Datenschutz und Betriebskosten dokumentieren. Nicht von nativer Rhubarb-Ausführbarkeit auf Browserunterstützung schließen.
- [ ] Falls für einen belastbaren Versuch neue Software/Modelle nötig sind: erst konkreten Bedarf und Alternativen nennen; erforderliche Freigabe abwarten. Keine Installation allein zur Recherche.
- [ ] Mit verfügbarem Material nachweisen: Analyse liefert aufnahmebezogene Zeitdaten; Stille bleibt geschlossen; Mundformen folgen hörbaren Lauten. Technische Test-WAV ist vorhanden, eine repräsentative deutsche Aufnahme kann für die Qualitätsentscheidung zusätzlich nötig sein.
- [ ] Ergebnis samt Grenze dokumentieren. Bei fehlendem Beleg ist die automatische Analyse offen; die restliche Vorlage darf nicht als vollständige Lösung bezeichnet werden. Vor Serverbetrieb oder Audioübertragung Entscheidung des Nutzers einholen.

### Task 2: Eine Tonspur und editierbare Bildwechsel
**Files:** Modify `index.html`; Create `studio/timeline.js`, `tests/timeline.test.cjs`.
**Interfaces:** `validateTimeline(scenes, duration)` prüft positive Dauer, erste Startzeit 0 und streng steigende weitere Startzeiten unterhalb der Dauer. `sceneAtTime(scenes, seconds)` liefert die aktive Szene; Endzeit bleibt in letzter Szene.
- [ ] Fehlende Tests schreiben: 12,4-s-Aufnahme mit Wechsel bei 3 s liefert bei 2,99 s Szene 1 und bei 3 s Szene 2; negative/gleiche/zu späte Zeiten werden abgelehnt.
- [ ] `node --test tests/timeline.test.cjs` ausführen, Fehlschlag bestätigen; minimale Timeline-Funktionen implementieren und erneut ausführen.
- [ ] Audioimport mit erfolgreichem Metadaten-/Decode-Nachweis durchführen; erst danach Aufnahme ersetzen. Daueranzeige, Vorschau, Bildwechsel und Export an tatsächliche Audiodauer anbinden; feste 40/50/60-Sekunden-Auswahl bei geladener Aufnahme ersetzen.
- [ ] Im Szeneneditor Startzeit pro Bild bearbeiten. Fotos weiter über vorhandenen Import laden; Titel/Untertitel bleiben optional. Audioende, Stop und erneutes Play synchron behandeln.
- [ ] Firefox: kurze und längere Datei, ungültige Datei, Bildwechsel exakt am Grenzpunkt, Fotoimport und sichtbare Ganzkörperfigur prüfen. Fehlerausgabe und Bildschirmaufnahme zur visuellen Kontrolle sichern.
- [ ] Eigenständigen Commit erstellen.

### Task 3: Aufnahme, Fotos und Munddaten gemeinsam speichern
**Files:** Modify `index.html`; Create `studio/project.js`, `tests/project.test.cjs`.
**Interfaces:** Neues Projektformat Version 5: `{version:5,topic,script,duration,audio:{name,mime,dataUrl}|null,scenes:[{start,headline,caption,bg,pose,image}],lipSync:{audioId,method,mouthCues}|null}`. `validateProject(data)` validiert vor Austausch des aktuellen Zustands; Version 4 mit relativen `at`-Werten wird anhand ihrer Dauer migriert.
- [ ] Tests schreiben und rot bestätigen: v5-Roundtrip erhält Audio/Bilder/Zeiten; v4 migriert; defekte Szenen oder ungültige Daten werden abgelehnt.
- [ ] Validierung/Migration implementieren; Tests grün ausführen. Medien vollständig vorladen, bevor das aktuelle Projekt ersetzt wird; fehlerhafte Imports dürfen den bisherigen Stand nicht löschen.
- [ ] Neue Tonspur verwirft alte Cues; Demo-Modus verändert das Nutzerprojekt nicht. Neue Vorlage entfernt alte Aufnahme und Analyse.
- [ ] Firefox: Projekt mit eigenem Foto und Audio speichern, neu öffnen und Wiedergabe prüfen; beschädigte Projektdatei lässt bisherigen Stand bestehen.
- [ ] Eigenständigen Commit erstellen.

### Task 4: Munddaten integrieren und Gesamtablauf abnehmen
**Files:** Modify `index.html`, `MOUTH_FORMS.md`, `HANDOFF.md`; Create `studio/lipsync.js`, `tests/lipsync.test.cjs`, `docs/acceptance.md`.
**Interfaces:** `validateCues(cues,duration)` validiert sortierte nicht überlappende Zeiten in Audiodauer; `mouthAtTime(cues,seconds)` liefert X außerhalb der Cues. Analyseadapter gemäß Task 1, erst nach geklärtem Ausführungsort.
- [ ] Tests rot/grün: Cue-Grenzen, Stille/Lücken, ungültige Zeiten, Tonspurwechsel, A–H/X-Abbildung. Bestehende Demo-Cues separat halten.
- [ ] Analyseadapter an Audioimport anbinden; Fortschritt/Fehler sichtbar machen; kein Lautstärke-Fallback als erkannte Sprachlaute ausgeben.
- [ ] Mundposition mit vorhandener mundloser Basis prüfen. Ton und Mund nutzen dieselbe Audiozeit; nach Pause/Stop/Ende korrekt schließen. Originalfigur nicht ersetzen.
- [ ] Gesamtablauf im vorhandenen Firefox: Aufnahme importieren, mehrere Fotos einsetzen, Startzeiten ändern, Vorschau, speichern/laden. Audio und Mund gleichzeitig in einer prüfbaren Aufzeichnung kontrollieren; keine Behauptung allein aus `audio.currentTime` ableiten.
- [ ] Vorhandenen Videoexport separat testen: Datei erzeugen und tatsächlich wiedergeben, Ton-/Bilddauer vergleichen. Format klar ausweisen; nicht unterstütztes MP4 ehrlich melden. Eine neue serverseitige MP4-Pipeline ist ein gesonderter Folgeplan.
- [ ] Echten iPhone-Safari-Test als gesonderten Nachweis erfassen; Desktop-Fensterbreite ersetzt ihn nicht. Ergebnis und offene Punkte dokumentieren, Commit erstellen.

## Selbstprüfung
Der Plan deckt die einfache Medienvorlage ab. Automatische Lautanalyse ist bewusst eine Machbarkeits- und Integrationsstufe mit Sperre für unvereinbarte Dienste; zuverlässiger iPhone-MP4-Export bleibt ein getrennt zu lösendes Thema. Kein Versprechen, dass eine reine GitHub-Pages-Seite bereits alle Anforderungen erfüllt.
