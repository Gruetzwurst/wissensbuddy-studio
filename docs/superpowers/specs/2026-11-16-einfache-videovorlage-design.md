# Einfache Wissensbuddy-Videovorlage

## Ziel und Bedienung
Eine Web-App nimmt eine durchgehende Sprachaufnahme und eigene Fotos entgegen. Der Nutzer ordnet Fotos den Szenen zu und legt ihre Wechselzeitpunkte fest. Wissensbuddy bleibt vollständig sichtbar und bewegt den Mund zur Aufnahme. Die Aufnahme kann selbst eingesprochen oder extern per KI erzeugt sein. Die bestehende Gestaltung und die Originalfigur bleiben Grundlage.

## Vereinbarte Richtung
- Keine zusätzlichen Programme, die der Nutzer installieren oder bedienen muss.
- Eine Tonspur bestimmt die Videolänge und die gemeinsame Zeitachse.
- Fotos pro Szene; einfache Startzeit bzw. Dauer, direkt in der Vorschau kontrollierbar.
- Automatische Analyse der Aufnahme erzeugt zeitlich passende Mundformen. In Sprechpausen bleibt der Mund geschlossen.
- Ruhige Ganzkörperfigur, kein dauerhaftes Wippen und kein Doppelmund.
- Vorschau, Projekt speichern/laden und schließlich Videoexport innerhalb derselben Oberfläche.

## Betrachtete Ansätze
1. Lautstärkegesteuerter Mund: einfach und lokal, aber keine lautbezogenen Mundformen.
2. Analyse von Sprachlauten: ausgewählt, weil passende Mundbewegungen wesentlich sind. Deutsches Audio und verschiedene Stimmen müssen praktisch überprüft werden.

## Technische Entscheidungen und offene Punkte
Bestehendes HTML/Canvas weiterverwenden (Vorschlag von Codex), solange keine nachgewiesene Einschränkung einen Umbau erfordert. Die Browseransicht soll keine manuelle Installation von Analyseprogrammen voraussetzen. Ob die Analyse sinnvoll im Browser oder über einen geschützten Server läuft, muss vor Implementierung durch eine Machbarkeitsprüfung geklärt werden. GitHub Pages allein führt keine serverseitige Analyse aus. Externe Audioübertragung, laufende Kosten und neue Dienste sind noch nicht vereinbart und müssen vor Nutzung transparent entschieden werden.

Die Bildqualität des kleinen vorhandenen Sprites und die Mundposition müssen anhand von Vorschauaufnahmen geprüft werden. Automatische Analyse ist keine Garantie für perfekte deutsche Lippensynchronität. Demo-Cues dürfen nicht als Analyseergebnis ausgegeben werden.

## Abgrenzung
Automatische Bildsuche, KI-Bilderstellung und eingebaute KI-Spracherzeugung haben vorerst keine Priorität. Exportformat und iPhone-Unterstützung bleiben zu verifizieren; zuverlässiges MP4 ist noch nicht vorhanden.

## Abnahmekriterien
Eigene durchgehende Aufnahme importieren; mehrere eigene Fotos einfügen; Bildwechsel ändern und prüfen; nachvollziehbar zur Aufnahme erzeugte Mundbewegungen mit geschlossenen Pausen; Figur vollständig und ohne Doppelmund; Projekt inklusive der benötigten Medien wieder öffnen. Browser- und iPhone-Nachweise getrennt dokumentieren. Export separat anhand einer tatsächlich abgespielten Datei verifizieren.

Status: Entwurf zur Bestätigung; keine Implementierungsfreigabe für zusätzliche Dienste oder Downloads.
