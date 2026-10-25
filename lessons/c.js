"use strict";
/* Kursinhalt. Blöcke: ["p", text] · ["code", quelltext, {run:false, stdin}] · ["tip", text] */
COURSES.c = {
  name: "C", file: "main.c",
  intro: "C ist die Grundlage von Betriebssystemen, Mikrocontrollern und vielen anderen Sprachen. Wer C versteht, versteht, was im Computer wirklich passiert.",
  starter: R`#include <stdio.h>

int main(void) {
    printf("Hallo, Codepfad!\n");
    return 0;
}`,
  lessons: [
  {
    id: "c1", level: 1, title: "Dein erstes C-Programm", mins: 6,
    body: [
      ["p", "C ist eine kompilierte Sprache: Ein Compiler übersetzt deinen Quelltext in Maschinencode, den der Prozessor direkt ausführt. Deshalb ist C sehr schnell und steckt in Betriebssystemen, Mikrocontrollern und Spiele-Engines."],
      ["code", R`#include <stdio.h>

int main(void) {
    printf("Hallo, Welt!\n");
    return 0;
}`],
      ["p", "`#include <stdio.h>` bindet die Standard-Ein- und -Ausgabe ein. Ohne sie kennt der Compiler `printf` nicht."],
      ["p", "`int main(void)` ist der Einstiegspunkt. Jedes C-Programm startet hier. `int` bedeutet: main gibt am Ende eine Ganzzahl zurück."],
      ["p", "`printf` schreibt Text auf die Konsole. `\\n` ist ein Zeilenumbruch. `return 0;` meldet dem Betriebssystem, dass alles fehlerfrei lief."],
      ["tip", "Jede Anweisung endet mit einem Semikolon `;`. Ein vergessenes Semikolon ist der häufigste Anfängerfehler."]
    ],
    quiz: [
      { q: "Wo beginnt die Ausführung eines C-Programms?", opts: ["In der ersten Zeile der Datei", "In der Funktion main", "Bei #include", "In der Funktion start"], a: 1,
        why: "Der Einstiegspunkt ist immer `main`. `#include` wird vorher vom Präprozessor verarbeitet, ist aber kein ausgeführter Code." },
      { q: "Was gibt dieser Code aus?", code: R`printf("A");
printf("B\n");`, opts: ["A und B in zwei Zeilen", "AB", "A B", "Nichts, es fehlt return"], a: 1,
        why: "`printf` fügt nicht automatisch einen Zeilenumbruch ein. Erst das `\\n` nach B beendet die Zeile." },
      { q: "Was fehlt in diesem Programm?", code: R`#include <stdio.h>
int main(void) {
    printf("Hi\n")
    return 0;
}`, opts: ["Ein Semikolon nach printf(...)", "Geschweifte Klammern um return", "Ein zweites #include", "Nichts, der Code ist korrekt"], a: 0,
        why: "Nach dem Aufruf von `printf` fehlt das Semikolon. Der Compiler meldet den Fehler oft erst in der nächsten Zeile." }
    ],
    task: { prompt: "Gib zwei Zeilen aus: `Ich lerne C` und darunter `Level 1`.", starter: R`#include <stdio.h>

int main(void) {
    // dein Code hier

    return 0;
}`, expect: "Ich lerne C\nLevel 1" }
  },
  {
    id: "c2", level: 1, title: "Variablen und Datentypen", mins: 8,
    body: [
      ["p", "Eine Variable ist ein benannter Speicherplatz. In C legst du vorher fest, welchen Typ sie hat. Der Typ bestimmt, wie viel Speicher belegt wird und welche Werte erlaubt sind."],
      ["code", R`int alter = 17;          // Ganzzahl
double preis = 4.99;     // Kommazahl, doppelte Genauigkeit
char note = 'A';         // einzelnes Zeichen

printf("Alter: %d\n", alter);
printf("Preis: %.2f Euro\n", preis);
printf("Note: %c\n", note);`],
      ["p", "Platzhalter in `printf`: `%d` für int, `%f` für float und double (`%.2f` zeigt zwei Nachkommastellen), `%c` für ein Zeichen und `%s` für Text."],
      ["p", "Typische Größen auf heutigen PCs: `char` 1 Byte, `int` 4 Byte, `double` 8 Byte. Mit `sizeof(int)` fragst du die Größe ab."],
      ["tip", "Ganzzahl-Division schneidet ab: `7 / 2` ergibt `3`, nicht `3.5`. Erst `7 / 2.0` liefert `3.5`, weil dann ein Operand eine Kommazahl ist."]
    ],
    quiz: [
      { q: "Welcher Platzhalter gibt einen int aus?", opts: ["%f", "%c", "%d", "%s"], a: 2, why: "`%d` steht für eine Dezimalzahl vom Typ int." },
      { q: "Was gibt dieser Code aus?", code: R`int a = 7;
int b = 2;
printf("%d", a / b);`, opts: ["3.5", "3", "4", "3.0"], a: 1,
        why: "Beide Operanden sind int, also wird ganzzahlig geteilt und der Rest abgeschnitten." },
      { q: "Welche Deklaration speichert ein einzelnes Zeichen korrekt?", opts: ["char c = \"A\";", "char c = 'A';", "string c = 'A';", "chr c = A;"], a: 1,
        why: "Einzelne Zeichen stehen in einfachen Anführungszeichen. Doppelte Anführungszeichen erzeugen einen String, also ein char-Array." }
    ],
    task: { prompt: "Lege `int stunden = 3` und `double lohn = 12.5` an. Gib das Produkt mit zwei Nachkommastellen aus: `Verdienst: 37.50`.", starter: R`#include <stdio.h>

int main(void) {
    int stunden = 3;
    double lohn = 12.5;
    // berechne und gib aus

    return 0;
}`, expect: "Verdienst: 37.50" }
  },
  {
    id: "c3", level: 1, title: "Bedingungen", mins: 8,
    body: [
      ["p", "Mit `if` trifft dein Programm Entscheidungen. Eine Bedingung gilt in C als wahr, wenn ihr Wert ungleich 0 ist."],
      ["code", R`int punkte = 72;

if (punkte >= 90) {
    printf("Sehr gut\n");
} else if (punkte >= 50) {
    printf("Bestanden\n");
} else {
    printf("Nicht bestanden\n");
}`],
      ["p", "Vergleichsoperatoren: `==` gleich, `!=` ungleich, `<`, `>`, `<=`, `>=`. Logisch verknüpfst du mit `&&` (und), `||` (oder) und `!` (nicht)."],
      ["p", "Der Modulo-Operator `%` liefert den Rest einer Division. `n % 2 == 0` prüft, ob n gerade ist."],
      ["tip", "`if (x = 5)` ist kein Vergleich, sondern eine Zuweisung. Sie ist immer wahr, weil 5 ungleich 0 ist. Für Vergleiche immer `==` verwenden."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`int x = 0;
if (x = 5) {
    printf("ja");
} else {
    printf("nein");
}`, opts: ["nein", "ja", "Compilerfehler", "Nichts"], a: 1,
        why: "`x = 5` weist 5 zu und hat selbst den Wert 5. Alles ungleich 0 gilt als wahr." },
      { q: "Was ergibt `17 % 5`?", opts: ["3", "2", "3.4", "5"], a: 1, why: "17 = 3 · 5 + 2. Der Rest ist 2." },
      { q: "Welche Bedingung ist wahr, wenn a zwischen 1 und 10 liegt (beide eingeschlossen)?", opts: ["a >= 1 || a <= 10", "1 <= a <= 10", "a >= 1 && a <= 10", "a > 1 && a < 10"], a: 2,
        why: "`||` wäre fast immer wahr. `1 <= a <= 10` kompiliert zwar, vergleicht aber erst `1 <= a` (0 oder 1) und dann dieses Ergebnis mit 10, ist also immer wahr." }
    ],
    task: { prompt: "Prüfe die Zahl `n = 14`: Gib `gerade` aus, wenn sie gerade ist, sonst `ungerade`.", starter: R`#include <stdio.h>

int main(void) {
    int n = 14;

    return 0;
}`, expect: "gerade" }
  },
  {
    id: "c4", level: 1, title: "Schleifen", mins: 9,
    body: [
      ["p", "Schleifen wiederholen Code. `for` nimmst du, wenn die Anzahl der Durchläufe feststeht, `while`, wenn eine Bedingung entscheidet."],
      ["code", R`for (int i = 1; i <= 5; i++) {
    printf("%d ", i);
}
printf("\n");

int n = 1;
while (n < 100) {
    n = n * 3;
}
printf("n = %d\n", n);`],
      ["p", "Die `for`-Zeile hat drei Teile: Start (`int i = 1`), Bedingung (`i <= 5`) und Schritt (`i++`). Das Beispiel gibt `1 2 3 4 5` aus, danach `n = 243`."],
      ["p", "`break` beendet die Schleife sofort, `continue` springt zum nächsten Durchlauf. `do { ... } while (...);` läuft mindestens einmal, weil die Bedingung erst am Ende geprüft wird."],
      ["tip", "Vergisst du in einer `while`-Schleife, die Variable zu ändern, läuft das Programm endlos. Die Live-Umgebung bricht nach einigen Sekunden ab."]
    ],
    quiz: [
      { q: "Wie oft läuft diese Schleife?", code: R`for (int i = 0; i < 10; i += 3) {
    // ...
}`, opts: ["3-mal", "4-mal", "10-mal", "Endlos"], a: 1, why: "i nimmt 0, 3, 6 und 9 an. Bei 12 ist die Bedingung falsch." },
      { q: "Was gibt dieser Code aus?", code: R`for (int i = 0; i < 5; i++) {
    if (i == 2) continue;
    if (i == 4) break;
    printf("%d", i);
}`, opts: ["0123", "013", "01234", "0134"], a: 1, why: "Bei 2 wird übersprungen, bei 4 abgebrochen. Übrig bleiben 0, 1 und 3." },
      { q: "Welche Schleife läuft garantiert mindestens einmal?", opts: ["for", "while", "do-while", "keine"], a: 2, why: "`do-while` prüft die Bedingung erst nach dem ersten Durchlauf." }
    ],
    task: { prompt: "Berechne mit einer Schleife die Summe der Zahlen von 1 bis 100 und gib `Summe: 5050` aus.", starter: R`#include <stdio.h>

int main(void) {
    int summe = 0;

    return 0;
}`, expect: "Summe: 5050" }
  },
  {
    id: "c5", level: 2, title: "Funktionen", mins: 10,
    body: [
      ["p", "Funktionen bündeln Code unter einem Namen. Sie nehmen Parameter entgegen und geben einen Wert zurück. So wird Code wiederverwendbar und einzeln testbar."],
      ["code", R`#include <stdio.h>

int quadrat(int x) {
    return x * x;
}

void begruesse(char name[]) {
    printf("Hallo %s!\n", name);
}

int main(void) {
    printf("%d\n", quadrat(7));
    begruesse("Mia");
    return 0;
}`],
      ["p", "`void` heißt: kein Rückgabewert. Steht eine Funktion unterhalb von `main`, brauchst du oben einen Prototyp wie `int quadrat(int x);`, damit der Compiler sie schon kennt."],
      ["tip", "C übergibt Parameter **per Wert**: Die Funktion bekommt eine Kopie. Änderst du den Parameter, bleibt die Variable des Aufrufers unverändert. Für echte Änderungen brauchst du Zeiger."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`void verdopple(int x) {
    x = x * 2;
}

int main(void) {
    int a = 5;
    verdopple(a);
    printf("%d", a);
}`, opts: ["10", "5", "0", "Compilerfehler"], a: 1, why: "`verdopple` ändert nur seine Kopie. `a` bleibt 5." },
      { q: "Was ist ein Funktionsprototyp?", opts: ["Eine Funktion ohne Rückgabewert", "Die Deklaration der Signatur vor der Definition", "Eine Funktion in einer anderen Datei", "Ein Makro"], a: 1,
        why: "Ein Prototyp wie `int max(int a, int b);` sagt dem Compiler Name, Parameter und Rückgabetyp, bevor die Funktion definiert ist." },
      { q: "Welcher Rückgabetyp passt zu einer Funktion, die nur etwas ausgibt?", opts: ["int", "void", "null", "char"], a: 1, why: "`void` bedeutet, dass nichts zurückgegeben wird." }
    ],
    task: { prompt: "Schreibe `int max(int a, int b)`, die die größere Zahl zurückgibt. `max(8, 13)` soll `13` ausgeben.", starter: R`#include <stdio.h>

int max(int a, int b) {
    // dein Code
}

int main(void) {
    printf("%d\n", max(8, 13));
    return 0;
}`, expect: "13" }
  },
  {
    id: "c6", level: 2, title: "Arrays und Strings", mins: 10,
    body: [
      ["p", "Ein Array speichert mehrere Werte desselben Typs direkt hintereinander im Speicher. Der Index beginnt bei 0."],
      ["code", R`int zahlen[5] = {4, 8, 15, 16, 23};
int summe = 0;

for (int i = 0; i < 5; i++) {
    summe += zahlen[i];
}
printf("Summe: %d\n", summe);

char wort[] = "Code";   // 5 Bytes: C o d e \0
printf("%s hat %d Zeichen\n", wort, (int)strlen(wort));`],
      ["p", "Strings sind in C einfache `char`-Arrays, die mit dem Nullzeichen `'\\0'` enden. `strlen` aus `<string.h>` zählt die Zeichen bis zu diesem Ende."],
      ["tip", "C prüft keine Array-Grenzen. `zahlen[5]` liest hinter dem Ende: undefiniertes Verhalten und eine der häufigsten Ursachen für Sicherheitslücken."]
    ],
    quiz: [
      { q: "Welcher Index gehört zum letzten Element von `int a[10]`?", opts: ["10", "9", "11", "-1"], a: 1, why: "Indizes laufen von 0 bis 9." },
      { q: "Wie viele Bytes belegt `char s[] = \"Hi\";`?", opts: ["2", "3", "4", "1"], a: 1, why: "H, i und das abschließende `\\0`." },
      { q: "Was gibt dieser Code aus?", code: R`char s[] = "Katze";
s[0] = 'T';
printf("%s", s);`, opts: ["Katze", "Tatze", "T", "Fehler: Strings sind unveränderlich"], a: 1,
        why: "Ein mit `[]` angelegtes Array ist eine veränderbare Kopie. Nur String-Literale über `char *` darf man nicht ändern." }
    ],
    task: { prompt: "Finde das größte Element im Array `{3, 41, 7, 29, 12}` und gib `Maximum: 41` aus.", starter: R`#include <stdio.h>

int main(void) {
    int werte[5] = {3, 41, 7, 29, 12};

    return 0;
}`, expect: "Maximum: 41" }
  },
  {
    id: "c7", level: 2, title: "Zeiger", mins: 12,
    body: [
      ["p", "Ein Zeiger speichert eine Speicheradresse. `&x` liefert die Adresse von x, `*p` greift auf den Wert an dieser Adresse zu. Das nennt man Dereferenzieren."],
      ["code", R`int wert = 42;
int *p = &wert;       // p zeigt auf wert

printf("%d\n", *p);   // 42
*p = 99;              // ändert wert über den Zeiger
printf("%d\n", wert); // 99`],
      ["p", "Mit Zeigern kann eine Funktion Variablen des Aufrufers verändern:"],
      ["code", R`void tausche(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}
// Aufruf: tausche(&x, &y);`, { run: false }],
      ["p", "Arrays und Zeiger hängen eng zusammen: Der Name eines Arrays steht für einen Zeiger auf sein erstes Element. `arr[i]` ist dasselbe wie `*(arr + i)`."],
      ["tip", "Ein nicht initialisierter Zeiger zeigt irgendwohin. Setze Zeiger ohne Ziel auf `NULL` und prüfe vor dem Dereferenzieren."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`int a = 3;
int *p = &a;
*p = *p + 4;
printf("%d", a);`, opts: ["3", "7", "4", "Eine Adresse"], a: 1, why: "`*p` ist `a`. Also wird `a` auf 3 + 4 gesetzt." },
      { q: "Was ist `*(arr + 2)` bei `int arr[] = {5, 6, 7, 8};`?", opts: ["5", "6", "7", "8"], a: 2, why: "`*(arr + 2)` ist `arr[2]`, das dritte Element." },
      { q: "Was speichert `int *p`?", opts: ["Eine Ganzzahl", "Die Adresse eines int", "Ein Array von int", "Den Typ int"], a: 1, why: "Der Stern in der Deklaration macht p zu einem Zeiger auf int." }
    ],
    task: { prompt: "Ergänze `tausche`, sodass `x=2, y=1` ausgegeben wird.", starter: R`#include <stdio.h>

void tausche(int *a, int *b) {
    // tausche die Werte
}

int main(void) {
    int x = 1, y = 2;
    tausche(&x, &y);
    printf("x=%d, y=%d\n", x, y);
    return 0;
}`, expect: "x=2, y=1" }
  },
  {
    id: "c8", level: 3, title: "Structs und dynamischer Speicher", mins: 14,
    body: [
      ["p", "Mit `struct` fasst du zusammengehörige Daten zu einem eigenen Typ zusammen."],
      ["code", R`struct Punkt {
    int x;
    int y;
};

struct Punkt p;
p.x = 3;
p.y = 4;
printf("(%d, %d)\n", p.x, p.y);

struct Punkt *pp = &p;   // Zeiger auf das Struct
pp->x = 10;
printf("(%d, %d)\n", p.x, p.y);`],
      ["p", "Steht die Größe erst zur Laufzeit fest, holst du Speicher mit `malloc` vom Heap. Was du anforderst, gibst du mit `free` zurück."],
      ["code", R`int n = 5;
int *feld = (int *)malloc(n * sizeof(int));
if (feld == NULL) {
    return 1;   // kein Speicher bekommen
}
for (int i = 0; i < n; i++) {
    feld[i] = i * i;
}
printf("%d\n", feld[4]);   // 16
free(feld);
feld = NULL;`],
      ["p", "Über einen Zeiger auf ein Struct greifst du mit `->` zu: `pp->x` ist die Kurzform von `(*pp).x`."],
      ["tip", "Drei klassische Fehler: Speicherleck (free vergessen), Use-after-free (nach free weiterbenutzen) und doppeltes free. Valgrind oder AddressSanitizer finden sie."]
    ],
    quiz: [
      { q: "Was liefert `malloc`, wenn kein Speicher verfügbar ist?", opts: ["Einen Block mit 0 Bytes", "NULL", "Es stürzt immer ab", "-1"], a: 1, why: "Deshalb prüft man das Ergebnis von `malloc` immer auf `NULL`." },
      { q: "Wie greifst du über `pp` auf x zu?", code: R`struct Punkt p = {3, 4};
struct Punkt *pp = &p;`, opts: ["pp.x", "pp->x", "*pp.x", "&pp->x"], a: 1,
        why: "`*pp.x` wird als `*(pp.x)` gelesen, weil `.` stärker bindet als `*`. Richtig wäre `(*pp).x` oder kurz `pp->x`." },
      { q: "Was passiert, wenn du `free` vergisst?", opts: ["Compilerfehler", "Ein Speicherleck bis zum Programmende", "Der Speicher wird sofort automatisch freigegeben", "Der Zeiger wird NULL"], a: 1,
        why: "C hat keine automatische Speicherbereinigung. Langlebige Programme wachsen dann immer weiter." }
    ],
    task: { prompt: "Reserviere mit `malloc` Platz für 6 int, fülle sie mit `i * 2` und gib die Summe aus: `Summe: 30`. Vergiss `free` nicht.", starter: R`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 6;
    int *feld = (int *)malloc(n * sizeof(int));

    return 0;
}`, expect: "Summe: 30" }
  },
  {
    id: "c9", level: 3, title: "Bitoperationen und undefiniertes Verhalten", mins: 14,
    body: [
      ["p", "Bitoperatoren arbeiten direkt auf den Binärstellen: `&` (und), `|` (oder), `^` (exklusiv-oder), `~` (invertieren), `<<` und `>>` (schieben)."],
      ["code", R`unsigned int flags = 0;
flags |= (1 << 2);        // Bit 2 setzen   -> 0100
flags |= (1 << 0);        // Bit 0 setzen   -> 0101
if (flags & (1 << 2)) {
    printf("Bit 2 ist an\n");
}
flags &= ~(1 << 2);       // Bit 2 löschen  -> 0001
printf("%d\n", flags);    // 1`],
      ["p", "`x << n` entspricht `x · 2ⁿ`, solange nichts überläuft. Bitmasken stecken in Hardware-Registern, Dateirechten unter Linux und kompakten Datenstrukturen."],
      ["p", "**Undefiniertes Verhalten** heißt: Der C-Standard schreibt nichts vor. Das Programm darf alles tun, auch scheinbar funktionieren. Typische Ursachen: Überlauf bei vorzeichenbehafteten Ganzzahlen, Zugriff außerhalb von Arrays, nicht initialisierte Variablen, Dereferenzieren von `NULL` und Ausdrücke wie `i = i++ + 1;`."],
      ["tip", "Kompiliere eigene Projekte mit `gcc -Wall -Wextra -fsanitize=address,undefined`. Dann warnen Compiler und Laufzeit vor vielen dieser Fehler."]
    ],
    quiz: [
      { q: "Was ergibt `5 & 3`?", opts: ["7", "1", "6", "2"], a: 1, why: "0101 & 0011 = 0001, also 1." },
      { q: "Was ergibt `1 << 4`?", opts: ["4", "5", "16", "8"], a: 2, why: "Einmal um 4 Stellen nach links geschoben: 1 · 2⁴ = 16." },
      { q: "Welcher Ausdruck ist undefiniertes Verhalten?", opts: ["unsigned int u = 4294967295u; u = u + 1;", "int i = INT_MAX; i = i + 1;", "int a = 7 % 3;", "char c = 'a' + 1;"], a: 1,
        why: "Überlauf bei unsigned ist definiert und rechnet modulo 2ⁿ. Überlauf bei signed int ist undefiniert." }
    ],
    task: { prompt: "Gib `5 ^ 3` und `12 >> 2` aus, jeweils in einer eigenen Zeile.", starter: R`#include <stdio.h>

int main(void) {

    return 0;
}`, expect: "6\n3" }
  }
  ]
};
