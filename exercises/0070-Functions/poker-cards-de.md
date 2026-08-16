# Pokerkarten-Prüfung

![Pokerkarten](https://cddataexchange.blob.core.windows.net/data-exchange/poker-cards.png)

## Einführung

In dieser Prüfung wirst du ein Programm entwickeln, um Pokerhände zu analysieren. Allerdings wurden **die Regeln für diese Übung vereinfacht**.

Unser Pokerspiel verwendet ein **Kartendeck mit 40 Karten**, das besteht aus:

* **Vier Farben**: Herzen ♥ (H), Karo ♦ (D), Kreuz ♣ (C), Pik ♠ (S)
* **Zehn Werten**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 0 (wobei 0 für 10 steht)
  
Im Gegensatz zum traditionellen Poker sind Buben, Damen, Könige und Asse nicht enthalten. Auch das Konzept von roten und schwarzen Farben wird nicht verwendet.

## Kartenrepräsentation

In unserem Programm wird jede Karte als **zweistelliger String** dargestellt:

* Das erste Zeichen stellt den Wert dar (1..9, 0 für 10)
* Das zweite Zeichen steht für die Farbe (H, D, C oder S)

Beispiele:

* _5H_ → _5 of hearts_
* _3D_ → _3 of diamonds_
* _0S_ → _10 of spades_

## Mindestanforderungen

Um die Prüfung zu bestehen, musst du die folgenden Methoden implementieren:

* _splitCardsString_
* _getCardValue_
* _getCardDescription_
* _getHighestCard_

**💡 Tipp:** Implementiere diese Methoden in ihrer Reihenfolge im Code.

Der Code enthält detaillierte Kommentare, die die Funktionalität jeder Methode erklären. Das Verständnis dieser Spezifikationen ist Teil der Prüfung, also lies sie sorgfältig durch, bevor du mit dem Programmieren beginnst.

## Erweiterte Anforderungen

Sobald du die Mindestanforderungen erfüllt hast, versuche, so viele zusätzliche Funktionen wie möglich zu implementieren.

**⏳ Priorisiere Qualität vor Quantität!**

Zum Beispiel reicht eine erfolgreiche Implementierung von _getCounts_, _isFlush_ und _isStraight_ bereits für ein **Sehr Gut**.

Falls du früher fertig bist, fordere dich selbst heraus, noch mehr Methoden zu implementieren und deine Programmierfähigkeiten unter Beweis zu stellen! 💪
