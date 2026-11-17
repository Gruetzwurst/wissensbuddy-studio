# Lautanalyse: geprüfter Stand

16.11.2026: Lokal sind Firefox und geckodriver verfügbar. Rhubarb, FFmpeg und Spracherkennungsprogramme wurden nicht gefunden. Es wurde für diese Umsetzung nichts heruntergeladen oder installiert; Audio wird nicht an externe Dienste gesendet.

Rhubarb unterstützt einen phonetic-Erkennungsmodus für nicht englische Aufnahmen. Das ist ein möglicher technischer Ausgangspunkt, aber kein Beleg für gute Ergebnisse mit deutschen Aufnahmen: https://github.com/DanielSWolf/rhubarb-lip-sync

Es existieren Browser-Portierungen. `biolimbo/lip-sync-engine` beschreibt einen lokalen WebAssembly-Betrieb und nennt ca. 80 KB JavaScript plus 2,2 MB WASM sowie zusätzliche Modelldaten (deren Gesamtgröße wurde nicht geprüft). Self-Hosting ist laut Dokumentation möglich; die Standardkonfiguration lädt vom CDN. `danieloquelis/rhubarb-lip-sync-wasm` beschreibt sich als Beta mit PocketSphinx. Diese Angaben sind Herstellerangaben, keine hier gemessenen Ergebnisse. Lizenzen werden als MIT angegeben; die vollständigen Paket- und Modelllizenzen müssten vor Übernahme geprüft werden.

Quellen:
- https://github.com/biolimbo/lip-sync-engine
- https://github.com/danieloquelis/rhubarb-lip-sync-wasm

Der Nutzer hat ausdrücklich gewählt, vorerst ohne Download weiterzubauen. Deshalb wurden diese Engines weder geladen noch ausgeführt. Es gibt keinen Analyse-Server, keine neuen Dienste, keine laufenden Kosten und keinen neuen Nachweis für automatische deutsche Lauterkennung.

Die App verwendet ohne importierte Munddaten weiterhin eine ausdrücklich als vereinfacht bezeichnete Lautstärkeanimation. Rhubarb-Zeitdaten können nach dem Laden ihrer zugehörigen Aufnahme importiert werden. Sie werden validiert und an die aktuelle Tonspur gebunden. Die mitgelieferten Demo-Daten sind keine berechneten Analyseergebnisse.
