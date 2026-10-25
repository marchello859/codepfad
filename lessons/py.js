"use strict";
/* Kursinhalt. Blöcke: ["p", text] · ["code", quelltext, {run:false, stdin}] · ["tip", text] */
COURSES.py = {
  name: "Python", file: "main.py",
  intro: "Python ist leicht zu lesen und trotzdem ein Profi-Werkzeug: für Automatisierung, Datenanalyse, KI und Webserver.",
  starter: R`name = "Codepfad"
for i in range(3):
    print(f"{i + 1}. Hallo von {name}!")`,
  lessons: [
  {
    id: "p1", level: 1, title: "Ausgabe und Variablen", mins: 6,
    body: [
      ["p", "Python wird Zeile für Zeile von einem Interpreter ausgeführt. Die Syntax ist knapp und gut lesbar, darum eignet sich Python ideal zum Einstieg."],
      ["code", R`print("Hallo, Welt!")

name = "Ada"
alter = 36
print(name, "ist", alter, "Jahre alt")
print(f"{name} wird nächstes Jahr {alter + 1}")`],
      ["p", "Variablen brauchen keine Typangabe: Python erkennt den Typ am Wert. `print` trennt mehrere Argumente mit einem Leerzeichen. Ein f-String wie `f\"{name}\"` setzt Ausdrücke in geschweiften Klammern direkt ein."],
      ["tip", "Kommentare beginnen mit `#`. Variablennamen schreibt man in Python klein_mit_unterstrich (snake_case)."]
    ],
    quiz: [
      { q: "Was gibt dieser Code aus?", code: R`print("a", "b", sep="-")`, opts: ["a b", "a-b", "ab", "-a-b-"], a: 1, why: "`sep` legt das Trennzeichen zwischen den Argumenten fest." },
      { q: "Was gibt dieser Code aus?", code: R`x = 5
x = x * 2 + 1
print(x)`, opts: ["11", "15", "10", "7"], a: 0, why: "Punkt vor Strich: 5 · 2 + 1 = 11." },
      { q: "Welche Zeile ist ein gültiger f-String?", opts: ["f\"Wert: {x}\"", "\"Wert: {x}\"f", "f(Wert: x)", "\"Wert: \" + {x}"], a: 0, why: "Das `f` steht direkt vor dem Anführungszeichen." }
    ],
    task: { prompt: "Lege `stadt = \"Berlin\"` und `einwohner = 3.7` an und gib mit einem f-String `Berlin hat 3.7 Mio. Einwohner` aus.", starter: R`stadt = "Berlin"
einwohner = 3.7
`, expect: "Berlin hat 3.7 Mio. Einwohner" }
  },
  {
    id: "p2", level: 1, title: "Datentypen und Eingabe", mins: 8,
    body: [
      ["p", "Die wichtigsten Grundtypen: `int` (Ganzzahl), `float` (Kommazahl), `str` (Text) und `bool` (`True` oder `False`). Mit `type(x)` siehst du den Typ eines Werts."],
      ["code", R`a = 7
b = 2
print(a / b)    # 3.5  echte Division
print(a // b)   # 3    ganzzahlige Division
print(a % b)    # 1    Rest
print(a ** b)   # 49   Potenz

eingabe = input("Zahl: ")   # liefert immer str
zahl = int(eingabe)
print(zahl * 2)`, { stdin: "21" }],
      ["p", "`input()` gibt immer einen String zurück. Zum Rechnen wandelst du ihn mit `int()` oder `float()` um. In der Live-Umgebung trägst du Eingaben ins Feld **Eingabe** ein, eine pro Zeile."],
      ["tip", "`\"3\" + \"4\"` ergibt `\"34\"`, nicht 7. Strings werden mit `+` aneinandergehängt."]
    ],
    quiz: [
      { q: "Was ergibt `7 // 2`?", opts: ["3.5", "3", "4", "1"], a: 1, why: "`//` teilt ganzzahlig und rundet nach unten." },
      { q: "Die Eingabe ist 5. Was wird ausgegeben?", code: R`x = input()
print(x * 3)`, opts: ["15", "555", "Fehler", "5 5 5"], a: 1, why: "x ist der String \"5\". Ein String mal 3 wiederholt ihn dreimal." },
      { q: "Welchen Typ hat `True`?", opts: ["str", "int", "bool", "NoneType"], a: 2, why: "`True` und `False` sind die beiden Werte vom Typ bool." }
    ],
    task: { prompt: "Lies zwei Zahlen mit `input()` ein und gib ihre Summe aus. Mit den Eingaben 12 und 30 soll `42` herauskommen.", starter: R`a = input()
b = input()
`, stdin: "12\n30", expect: "42" }
  },
  {
    id: "p3", level: 1, title: "Bedingungen", mins: 7,
    body: [
      ["p", "Python nutzt Einrückung statt geschweifter Klammern: Alles, was nach dem Doppelpunkt eingerückt ist, gehört zum Block. Üblich sind 4 Leerzeichen."],
      ["code", R`temperatur = 23

if temperatur > 30:
    print("Heiß")
elif temperatur > 18:
    print("Angenehm")
else:
    print("Kalt")`],
      ["p", "Logische Operatoren werden ausgeschrieben: `and`, `or`, `not`. Vergleiche lassen sich verketten: `0 < x < 10`."],
      ["tip", "Leere Werte gelten als falsch: `0`, `\"\"`, `[]`, `{}` und `None`. Statt `if len(liste) > 0:` schreibst du kurz `if liste:`."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`x = 15
if x > 10:
    print("A")
elif x > 5:
    print("B")
else:
    print("C")`, opts: ["A", "B", "A und B", "C"], a: 0, why: "Nur der erste zutreffende Zweig läuft, auch wenn spätere ebenfalls passen würden." },
      { q: "Ist `0 < 5 < 3` in Python wahr?", opts: ["Ja", "Nein", "Syntaxfehler", "Hängt vom Typ ab"], a: 1, why: "Verkettete Vergleiche bedeuten `0 < 5 and 5 < 3`. Der zweite Teil ist falsch." },
      { q: "Was ist an diesem Code falsch?", code: R`if True:
print("ja")`, opts: ["Es fehlt eine Klammer", "Die Einrückung fehlt", "True muss klein geschrieben werden", "Nichts"], a: 1, why: "Ohne Einrückung gehört `print` nicht zum if-Block. Python meldet einen IndentationError." }
    ],
    task: { prompt: "Setze `jahr = 2024`. Gib `Schaltjahr` aus, wenn das Jahr durch 4, aber nicht durch 100 teilbar ist, oder wenn es durch 400 teilbar ist. Sonst `Kein Schaltjahr`.", starter: R`jahr = 2024
`, expect: "Schaltjahr" }
  },
  {
    id: "p4", level: 1, title: "Schleifen", mins: 8,
    body: [
      ["code", R`for i in range(1, 6):
    print(i, end=" ")
print()

for buchstabe in "Code":
    print(buchstabe)

n = 1
while n < 100:
    n *= 3
print(n)   # 243`],
      ["p", "`range(start, stop, schritt)` zählt von start bis **ausschließlich** stop. `for` läuft über jede Sammlung: Strings, Listen, Dictionaries."],
      ["p", "`break` und `continue` funktionieren wie in anderen Sprachen. Eine Besonderheit: Schleifen dürfen einen `else`-Block haben, der läuft, wenn kein `break` kam."],
      ["tip", "Brauchst du Index und Wert, nimm `for i, wert in enumerate(liste):` statt `range(len(liste))`."]
    ],
    quiz: [
      { q: "Welche Zahlen erzeugt `range(2, 10, 3)`?", opts: ["2, 5, 8", "2, 5, 8, 11", "3, 6, 9", "2, 4, 6, 8"], a: 0, why: "Start 2, Schritt 3, Ende vor 10." },
      { q: "Was wird ausgegeben?", code: R`summe = 0
for i in range(4):
    summe += i
print(summe)`, opts: ["10", "6", "4", "3"], a: 1, why: "`range(4)` liefert 0, 1, 2, 3. Die Summe ist 6." },
      { q: "Was wird ausgegeben?", code: R`for i in range(3):
    if i == 5:
        break
else:
    print("fertig")`, opts: ["fertig", "Nichts", "0 1 2", "Fehler"], a: 0, why: "Die Schleife endet ohne `break`, also läuft der `else`-Block." }
    ],
    task: { prompt: "Gib die Siebenerreihe in einer Zeile aus, getrennt durch Leerzeichen: `7 14 21 28 35 42 49 56 63 70`.", starter: R`for i in range(1, 11):
    pass
`, expect: "7 14 21 28 35 42 49 56 63 70" }
  },
  {
    id: "p5", level: 2, title: "Listen und Dictionaries", mins: 10,
    body: [
      ["code", R`farben = ["rot", "grün", "blau"]
farben.append("gelb")
print(farben[0], farben[-1])   # rot gelb
print(farben[1:3])             # ['grün', 'blau']
print(len(farben))             # 4

alter = {"Ada": 36, "Linus": 54}
alter["Grace"] = 85
for name in sorted(alter):
    print(name, alter[name])`],
      ["p", "Listen sind geordnet und veränderbar. Der Index beginnt bei 0, negative Indizes zählen von hinten. `liste[a:b]` liefert eine Teilliste von a bis ausschließlich b."],
      ["p", "Dictionaries speichern Schlüssel-Wert-Paare und finden einen Wert über den Schlüssel sehr schnell. `d.get(k, standard)` vermeidet einen Fehler, wenn der Schlüssel fehlt."],
      ["tip", "`b = a` kopiert eine Liste nicht: Beide Namen zeigen auf dieselbe Liste. Eine echte Kopie bekommst du mit `a.copy()` oder `a[:]`."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`a = [1, 2, 3]
b = a
b.append(4)
print(a)`, opts: ["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "Fehler"], a: 1, why: "a und b sind zwei Namen für dieselbe Liste." },
      { q: "Was liefert `[10, 20, 30, 40][-2]`?", opts: ["20", "30", "40", "Fehler"], a: 1, why: "-1 ist das letzte Element, -2 das vorletzte." },
      { q: "Was wird ausgegeben?", code: R`d = {"x": 1}
print(d.get("y", 0))`, opts: ["None", "0", "KeyError", "1"], a: 1, why: "`get` liefert den Standardwert 0, weil \"y\" fehlt." }
    ],
    task: { prompt: "Zähle, wie oft jedes Wort in `woerter` vorkommt. Gib dann alphabetisch sortiert je Zeile Wort und Anzahl aus: `a 3`, `b 2`, `c 1`.", starter: R`woerter = ["a", "b", "a", "c", "a", "b"]
zaehler = {}
`, expect: "a 3\nb 2\nc 1" }
  },
  {
    id: "p6", level: 2, title: "Funktionen", mins: 10,
    body: [
      ["code", R`def flaeche(breite, hoehe=1):
    """Berechnet die Fläche eines Rechtecks."""
    return breite * hoehe

print(flaeche(4, 5))               # 20
print(flaeche(4))                  # 4, hoehe nutzt den Standardwert
print(flaeche(hoehe=2, breite=3))  # 6

def min_max(zahlen):
    return min(zahlen), max(zahlen)

klein, gross = min_max([4, 9, 1])
print(klein, gross)                # 1 9`],
      ["p", "`def` definiert eine Funktion. Parameter können Standardwerte haben und per Name übergeben werden. Mehrere Rückgabewerte sind in Wahrheit ein Tupel, das du direkt entpacken kannst."],
      ["p", "`*args` sammelt beliebig viele Positionsargumente, `**kwargs` beliebig viele benannte Argumente."],
      ["tip", "Nutze nie eine Liste als Standardwert (`def f(x=[])`). Sie wird nur einmal erzeugt und zwischen allen Aufrufen geteilt. Schreibe `x=None` und lege die Liste in der Funktion an."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`def f(a, b=2):
    return a * b
print(f(3), f(3, 3))`, opts: ["6 9", "5 6", "3 9", "Fehler"], a: 0, why: "f(3) nutzt b=2, f(3, 3) überschreibt b." },
      { q: "Was wird ausgegeben?", code: R`def add(*zahlen):
    return sum(zahlen)
print(add(1, 2, 3))`, opts: ["6", "(1, 2, 3)", "Fehler", "1"], a: 0, why: "`*zahlen` sammelt die Argumente in einem Tupel, `sum` addiert es." },
      { q: "Was gibt eine Funktion ohne `return` zurück?", opts: ["0", "Einen leeren String", "None", "Einen Fehler"], a: 2, why: "Ohne `return` liefert jede Python-Funktion `None`." }
    ],
    task: { prompt: "Schreibe `ist_palindrom(wort)`, die `True` liefert, wenn das Wort rückwärts gleich ist (Groß- und Kleinschreibung ignorieren). `print(ist_palindrom(\"Rentner\"))` soll `True` ausgeben.", starter: R`def ist_palindrom(wort):
    pass

print(ist_palindrom("Rentner"))
`, expect: "True" }
  },
  {
    id: "p7", level: 3, title: "Klassen und Ausnahmen", mins: 14,
    body: [
      ["code", R`class Konto:
    def __init__(self, inhaber, stand=0):
        self.inhaber = inhaber
        self.stand = stand

    def einzahlen(self, betrag):
        if betrag <= 0:
            raise ValueError("Betrag muss positiv sein")
        self.stand += betrag

    def __str__(self):
        return f"{self.inhaber}: {self.stand} Euro"

k = Konto("Mia")
k.einzahlen(50)
print(k)   # Mia: 50 Euro

try:
    k.einzahlen(-5)
except ValueError as fehler:
    print("Abgelehnt:", fehler)`],
      ["p", "Eine Klasse ist ein Bauplan, ein Objekt eine konkrete Instanz davon. `__init__` richtet das neue Objekt ein, `self` ist das Objekt selbst. Methoden mit doppelten Unterstrichen wie `__str__` steuern eingebautes Verhalten, hier die Ausgabe mit `print`."],
      ["p", "Vererbung: `class Sparkonto(Konto):` übernimmt alles von Konto. Mit `super().__init__(...)` rufst du den Konstruktor der Elternklasse auf."],
      ["p", "Fehler signalisierst du mit `raise` und behandelst sie mit `try` und `except`. So bricht das Programm nicht ab, sondern reagiert gezielt."],
      ["tip", "Fange nur Ausnahmen, die du sinnvoll behandeln kannst. Ein nacktes `except:` versteckt echte Bugs."]
    ],
    quiz: [
      { q: "Wofür steht `self`?", opts: ["Die Klasse", "Das aktuelle Objekt", "Die Elternklasse", "Ein Schlüsselwort ohne Bedeutung"], a: 1, why: "Python übergibt das Objekt, auf dem die Methode aufgerufen wird, als ersten Parameter." },
      { q: "Was wird ausgegeben?", code: R`class A:
    def hallo(self):
        return "A"

class B(A):
    def hallo(self):
        return "B" + super().hallo()

print(B().hallo())`, opts: ["B", "A", "BA", "AB"], a: 2, why: "B liefert \"B\" und hängt das Ergebnis der Elternmethode an." },
      { q: "Welche Methode bestimmt, was `print(obj)` ausgibt?", opts: ["__init__", "__str__ (oder __repr__)", "__print__", "__out__"], a: 1, why: "`print` ruft `str(obj)` auf, also `__str__`. Fehlt sie, wird `__repr__` genutzt." }
    ],
    task: { prompt: "Ergänze die Klasse `Rechteck` um eine Methode `flaeche()`. `print(Rechteck(3, 4).flaeche())` soll `12` ausgeben.", starter: R`class Rechteck:
    def __init__(self, breite, hoehe):
        self.breite = breite
        self.hoehe = hoehe

print(Rechteck(3, 4).flaeche())
`, expect: "12" }
  },
  {
    id: "p8", level: 3, title: "Comprehensions, Generatoren, Lambdas", mins: 12,
    body: [
      ["code", R`quadrate = [x * x for x in range(6)]
gerade = [x for x in quadrate if x % 2 == 0]
print(gerade)                 # [0, 4, 16]

laengen = {w: len(w) for w in ["py", "code"]}
print(laengen["code"])        # 4

def zaehle_hoch(n):
    i = 0
    while i < n:
        yield i
        i += 1

print(sum(zaehle_hoch(5)))    # 10

personen = [("Ada", 36), ("Tim", 20)]
personen.sort(key=lambda p: p[1])
print(personen[0][0])         # Tim`],
      ["p", "Comprehensions bauen Listen, Dictionaries und Sets in einer Zeile. Generatoren mit `yield` liefern Werte erst bei Bedarf und sparen so Speicher, selbst bei Millionen von Elementen."],
      ["p", "`lambda` erzeugt kleine, namenlose Funktionen, typisch als `key` beim Sortieren oder für `map` und `filter`."],
      ["tip", "Lesbarkeit geht vor: Wird eine Comprehension länger als eine Zeile oder verschachtelt, ist eine normale Schleife oft besser."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`print([c.upper() for c in "abc" if c != "b"])`, opts: ["['A', 'B', 'C']", "['A', 'C']", "AC", "['a', 'c']"], a: 1, why: "\"b\" wird herausgefiltert, die anderen werden groß geschrieben." },
      { q: "Was ist der Hauptvorteil eines Generators?", opts: ["Er ist immer schneller", "Werte werden erst bei Bedarf erzeugt", "Er kann Listen sortieren", "Er läuft parallel"], a: 1, why: "Ein Generator hält nie alle Werte gleichzeitig im Speicher." },
      { q: "Was wird ausgegeben?", code: R`f = lambda x, y: x * y
print(f(3, 4))`, opts: ["7", "12", "34", "Fehler"], a: 1, why: "Die Lambda-Funktion multipliziert ihre beiden Argumente." }
    ],
    task: { prompt: "Erzeuge mit einer Comprehension die Liste aller Zahlen von 1 bis 30, die durch 3 und durch 5 teilbar sind, und gib sie aus: `[15, 30]`.", starter: R`zahlen = []
print(zahlen)
`, expect: "[15, 30]" }
  }
  ]
};
