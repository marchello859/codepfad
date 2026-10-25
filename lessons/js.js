"use strict";
/* Kursinhalt. Blöcke: ["p", text] · ["code", quelltext, {run:false, stdin}] · ["tip", text] */
COURSES.js = {
  name: "JavaScript", file: "main.js",
  intro: "JavaScript läuft in jedem Browser und mit Node.js auf Servern. Es ist die Sprache des Webs und steckt in fast jeder App.",
  starter: R`const sprachen = ["C", "Python", "JavaScript"];

for (const s of sprachen) {
  console.log("Ich lerne " + s);
}`,
  lessons: [
  {
    id: "j1", level: 1, title: "Ausgabe und Variablen", mins: 6,
    body: [
      ["p", "JavaScript läuft in jedem Browser und mit Node.js auch auf Servern. Ausgaben schreibst du mit `console.log`."],
      ["code", R`console.log("Hallo, Welt!");

const name = "Ada";   // wird nicht neu zugewiesen
let punkte = 10;      // veränderbar
punkte = punkte + 5;

console.log(name, "hat", punkte, "Punkte");`],
      ["p", "Nimm `const` für Werte, die nicht neu zugewiesen werden, und `let` für alles, was sich ändert. Das alte `var` solltest du nicht mehr verwenden, weil es Block-Grenzen ignoriert."],
      ["tip", "`const` macht nur die Bindung fest, nicht den Inhalt. Ein `const`-Array kannst du trotzdem mit `push` erweitern."]
    ],
    quiz: [
      { q: "Was passiert hier?", code: R`const x = 5;
x = 6;`, opts: ["x ist danach 6", "TypeError: Zuweisung an eine Konstante", "x bleibt still 5", "Nichts"], a: 1, why: "Eine `const`-Bindung darf nicht neu zugewiesen werden." },
      { q: "Was wird ausgegeben?", code: R`const liste = [1];
liste.push(2);
console.log(liste.length);`, opts: ["1", "2", "Fehler", "undefined"], a: 1, why: "Der Inhalt eines `const`-Arrays ist veränderbar." },
      { q: "Womit deklarierst du einen Zähler, der sich in einer Schleife ändert?", opts: ["const", "let", "var", "def"], a: 1, why: "`let` ist veränderbar und gilt nur im Block." }
    ],
    task: { prompt: "Lege `const vorname = \"Lea\"` und `let alter = 16` an, erhöhe alter um 1 und gib `Lea ist 17` aus.", starter: R`const vorname = "Lea";
let alter = 16;
`, expect: "Lea ist 17" }
  },
  {
    id: "j2", level: 1, title: "Typen und Vergleiche", mins: 8,
    body: [
      ["code", [
        "console.log(typeof 42);        // \"number\"",
        "console.log(typeof \"42\");      // \"string\"",
        "console.log(typeof true);      // \"boolean\"",
        "console.log(typeof undefined); // \"undefined\"",
        "",
        "console.log(5 == \"5\");   // true  (wandelt Typen um)",
        "console.log(5 === \"5\");  // false (prüft auch den Typ)",
        "",
        "const name = \"Ben\";",
        "console.log(`Hallo ${name}, 2 + 3 = ${2 + 3}`);"
      ].join("\n")],
      ["p", "JavaScript hat einen einzigen Zahlentyp `number` für Ganz- und Kommazahlen. Dazu kommen `string`, `boolean`, `undefined`, `null`, `bigint`, `symbol` und `object`."],
      ["p", "Nutze immer `===` und `!==`. Der lockere Vergleich `==` wandelt Typen nach schwer merkbaren Regeln um."],
      ["p", "Template-Strings stehen in Backticks und setzen mit `${...}` Ausdrücke direkt ein."],
      ["tip", "`0.1 + 0.2` ergibt `0.30000000000000004`. Kommazahlen sind binär nicht exakt darstellbar. Geldbeträge rechnet man deshalb in Cent als Ganzzahl."]
    ],
    quiz: [
      { q: "Was geben die beiden Zeilen aus?", code: R`console.log("5" + 3);
console.log("5" - 3);`, opts: ["8 und 2", "53 und 2", "53 und NaN", "8 und 8"], a: 1, why: "`+` mit einem String verkettet. `-` gibt es nur für Zahlen, deshalb wird \"5\" umgewandelt." },
      { q: "Was ergibt `typeof null`?", opts: ["\"null\"", "\"undefined\"", "\"object\"", "\"number\""], a: 2, why: "Ein historischer Fehler in JavaScript, der aus Kompatibilitätsgründen geblieben ist." },
      { q: "Was ergibt `null == undefined`?", opts: ["true", "false", "TypeError", "null"], a: 0, why: "Beim lockeren Vergleich gelten `null` und `undefined` als gleich. Mit `===` wäre es false." }
    ],
    task: { prompt: "Gib mit einem Template-String `3 * 7 = 21` aus. Das Ergebnis 21 soll im String berechnet werden.", starter: R`const a = 3;
const b = 7;
`, expect: "3 * 7 = 21" }
  },
  {
    id: "j3", level: 1, title: "Bedingungen und Schleifen", mins: 8,
    body: [
      ["code", R`const stunde = 14;

if (stunde < 12) {
  console.log("Guten Morgen");
} else if (stunde < 18) {
  console.log("Guten Tag");
} else {
  console.log("Guten Abend");
}

for (let i = 1; i <= 3; i++) {
  console.log("Runde", i);
}

const sprachen = ["C", "Python", "JS"];
for (const s of sprachen) {
  console.log(s);
}`],
      ["p", "`if`, `for` und `while` sehen aus wie in C. Für Arrays gibt es `for...of`, das direkt über die Werte läuft. `for...in` läuft über die Schlüssel eines Objekts."],
      ["p", "Der Bedingungsoperator ist eine Kurzform von if/else: `const status = alter >= 18 ? \"volljährig\" : \"minderjährig\";`"],
      ["tip", "Falsy sind nur `false`, `0`, `\"\"`, `null`, `undefined` und `NaN`. Alles andere ist truthy, auch `\"0\"` und `[]`."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`if ([]) console.log("ja");
else console.log("nein");`, opts: ["ja", "nein", "Fehler", "undefined"], a: 0, why: "Ein leeres Array ist ein Objekt und damit truthy." },
      { q: "Was wird ausgegeben?", code: R`for (const x of [10, 20]) {
  console.log(x);
}`, opts: ["0 und 1", "10 und 20", "x und x", "Fehler"], a: 1, why: "`for...of` liefert die Werte. `for...in` hätte die Indizes \"0\" und \"1\" geliefert." },
      { q: "Was wird ausgegeben?", code: R`const n = 7;
console.log(n % 2 === 0 ? "gerade" : "ungerade");`, opts: ["gerade", "ungerade", "true", "1"], a: 1, why: "7 % 2 ist 1, die Bedingung ist falsch." }
    ],
    task: { prompt: "FizzBuzz bis 15: Gib für jede Zahl von 1 bis 15 eine Zeile aus. Bei Vielfachen von 3 `Fizz`, bei Vielfachen von 5 `Buzz`, bei beiden `FizzBuzz`, sonst die Zahl.", starter: R`for (let i = 1; i <= 15; i++) {

}
`, expect: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" }
  },
  {
    id: "j4", level: 2, title: "Funktionen", mins: 9,
    body: [
      ["code", R`function begruesse(name = "Gast") {
  return "Hallo " + name;
}

const quadrat = (x) => x * x;   // Arrow Function
const summe = (...zahlen) => zahlen.reduce((a, b) => a + b, 0);

console.log(begruesse());        // Hallo Gast
console.log(quadrat(9));         // 81
console.log(summe(1, 2, 3, 4));  // 10`],
      ["p", "Funktionen sind in JavaScript ganz normale Werte: Du kannst sie in Variablen speichern, als Argument übergeben und zurückgeben."],
      ["p", "Arrow Functions (`=>`) sind kürzer. Besteht der Körper aus einem einzigen Ausdruck, wird dieser automatisch zurückgegeben."],
      ["tip", "Arrow Functions haben kein eigenes `this`. Für Objekt-Methoden, die `this` brauchen, nimm die normale Schreibweise."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`const f = (a, b = 10) => a + b;
console.log(f(5));`, opts: ["5", "15", "NaN", "undefined"], a: 1, why: "b bekommt den Standardwert 10." },
      { q: "Was wird ausgegeben?", code: R`const verdopple = x => { x * 2 };
console.log(verdopple(4));`, opts: ["8", "undefined", "4", "Fehler"], a: 1, why: "Mit geschweiften Klammern ist der Körper ein Block. Ohne `return` liefert er `undefined`." },
      { q: "Was wird ausgegeben?", code: R`function an(f) { return f(3); }
console.log(an(x => x + 1));`, opts: ["3", "4", "x + 1", "Fehler"], a: 1, why: "Die übergebene Funktion wird mit 3 aufgerufen." }
    ],
    task: { prompt: "Schreibe eine Arrow Function `istGerade`, die für gerade Zahlen `true` liefert. Gib `istGerade(10)` und `istGerade(7)` in zwei Zeilen aus.", starter: R`const istGerade = (n) => false;

console.log(istGerade(10));
console.log(istGerade(7));
`, expect: "true\nfalse" }
  },
  {
    id: "j5", level: 2, title: "Arrays und Objekte", mins: 11,
    body: [
      ["code", R`const noten = [2, 1, 3, 1, 4];

const verdoppelt = noten.map(n => n * 2);     // [4, 2, 6, 2, 8]
const gut = noten.filter(n => n <= 2);        // [2, 1, 1]
const schnitt = noten.reduce((a, b) => a + b) / noten.length;
console.log(verdoppelt, gut, schnitt);

const user = { name: "Ada", stadt: "London", alter: 36 };
const { name, ...rest } = user;               // Destructuring
console.log(name, rest);
const aelter = { ...user, alter: 37 };        // Spread
console.log(aelter.alter);`],
      ["p", "`map` wandelt jedes Element um, `filter` behält passende Elemente, `reduce` fasst alles zu einem Wert zusammen. Keine dieser Methoden verändert das Original-Array."],
      ["p", "Objekte sammeln Eigenschaften unter Namen. Destructuring holt Werte heraus, der Spread-Operator `...` kopiert sie in ein neues Objekt oder Array."],
      ["tip", "`sort()` sortiert ohne Vergleichsfunktion als Text: `[10, 9, 1].sort()` ergibt `[1, 10, 9]`. Für Zahlen schreibst du `sort((a, b) => a - b)`."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`console.log([1, 2, 3, 4].filter(x => x % 2).map(x => x * 10));`, opts: ["[10, 30]", "[20, 40]", "[10, 20, 30, 40]", "[1, 3]"], a: 0, why: "`x % 2` ist für ungerade Zahlen 1 (truthy). Übrig bleiben 1 und 3, mal 10." },
      { q: "Was wird ausgegeben?", code: R`const { a, b = 5 } = { a: 1 };
console.log(a + b);`, opts: ["1", "6", "NaN", "undefined"], a: 1, why: "b fehlt im Objekt und bekommt den Standardwert 5." },
      { q: "Was ergibt `[10, 9, 1].sort()`?", opts: ["[1, 9, 10]", "[10, 9, 1]", "[1, 10, 9]", "[9, 10, 1]"], a: 2, why: "Als Text verglichen kommt \"10\" vor \"9\"." }
    ],
    task: { prompt: "Berechne mit `reduce` die Summe von `preise` und gib `Gesamt: 28` aus.", starter: R`const preise = [4.5, 12, 3, 8.5];
`, expect: "Gesamt: 28" }
  },
  {
    id: "j6", level: 3, title: "Scope und Closures", mins: 12,
    body: [
      ["code", R`function zaehler() {
  let stand = 0;
  return function () {
    stand++;
    return stand;
  };
}

const klick = zaehler();
console.log(klick()); // 1
console.log(klick()); // 2

const anderer = zaehler();
console.log(anderer()); // 1, eigener Zustand`],
      ["p", "Eine Closure ist eine Funktion, die sich die Variablen ihrer Entstehungsumgebung merkt. `stand` lebt weiter, obwohl `zaehler()` längst beendet ist. So baut man private Zustände, Fabrikfunktionen und Event-Handler."],
      ["p", "`let` und `const` gelten nur im umgebenden Block `{ }`. Variablen mit `var` gelten in der ganzen Funktion und werden an deren Anfang gezogen (Hoisting)."],
      ["tip", "Klassiker im Vorstellungsgespräch: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));` gibt dreimal `3` aus. Mit `let` bekommt jeder Durchlauf sein eigenes `i`."]
    ],
    quiz: [
      { q: "Was wird ausgegeben?", code: R`function mache(x) {
  return y => x + y;
}
const plus5 = mache(5);
console.log(plus5(3));`, opts: ["5", "8", "3", "undefined"], a: 1, why: "Die innere Funktion merkt sich x = 5." },
      { q: "Was wird ausgegeben?", code: R`for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}`, opts: ["0 1 2", "3 3 3", "2 2 2", "undefined"], a: 1, why: "Alle drei Callbacks teilen sich dasselbe `var i`, das am Ende 3 ist." },
      { q: "Was wird ausgegeben?", code: R`{
  let geheim = 1;
}
console.log(typeof geheim);`, opts: ["\"number\"", "\"undefined\"", "ReferenceError", "1"], a: 1, why: "Außerhalb des Blocks gibt es `geheim` nicht. `typeof` wirft bei unbekannten Namen keinen Fehler, sondern liefert \"undefined\"." }
    ],
    task: { prompt: "Schreibe `erzeugeMultiplikator(faktor)`, die eine Funktion zurückgibt. `erzeugeMultiplikator(3)(14)` soll `42` ergeben.", starter: R`function erzeugeMultiplikator(faktor) {

}

const mal3 = erzeugeMultiplikator(3);
console.log(mal3(14));
`, expect: "42" }
  },
  {
    id: "j7", level: 3, title: "Promises und async/await", mins: 14,
    body: [
      ["code", R`const warte = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function ablauf() {
  console.log("Start");
  await warte(500);
  console.log("nach 0,5 s");
  return "fertig";
}

ablauf().then(ergebnis => console.log(ergebnis));
console.log("läuft weiter");`],
      ["p", "JavaScript läuft in einem einzigen Thread. Langsame Aufgaben wie Netzwerkanfragen blockieren ihn nicht, sondern liefern ein Promise: das Versprechen auf einen späteren Wert."],
      ["p", "`async` markiert eine Funktion, die immer ein Promise zurückgibt. `await` pausiert nur diese Funktion, bis das Promise erfüllt ist. Die Ausgabe oben lautet: `Start`, `läuft weiter`, `nach 0,5 s`, `fertig`."],
      ["p", "Fehler fängst du mit `try` und `catch` um das `await`. Unabhängige Aufgaben startest du gleichzeitig mit `await Promise.all([...])`."],
      ["tip", "Event Loop: Zuerst läuft der synchrone Code komplett durch, dann alle Microtasks (Promise-Callbacks), dann Tasks wie `setTimeout`."]
    ],
    quiz: [
      { q: "In welcher Reihenfolge erscheinen die Buchstaben?", code: R`console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`, opts: ["A B C D", "A D C B", "A D B C", "A C D B"], a: 1, why: "Synchron zuerst (A, D), dann die Microtask (C), zuletzt der Timer (B)." },
      { q: "Was gibt eine `async`-Funktion immer zurück?", opts: ["undefined", "Ein Promise", "Den Wert direkt", "Einen Callback"], a: 1, why: "Auch ein `return 5` wird in ein Promise verpackt." },
      { q: "Wie wartest du auf zwei unabhängige Promises gleichzeitig?", opts: ["await p1; await p2;", "await Promise.all([p1, p2])", "p1 + p2", "Promise.wait(p1, p2)"], a: 1, why: "`Promise.all` wartet parallel auf alle und liefert ein Array der Ergebnisse." }
    ],
    task: { prompt: "Schreibe eine async-Funktion `main`, die `start` ausgibt, mit `warte(200)` wartet und danach `fertig` ausgibt. Rufe sie auf.", starter: R`const warte = (ms) => new Promise(resolve => setTimeout(resolve, ms));

`, expect: "start\nfertig" }
  },
  {
    id: "j8", level: 3, title: "Klassen und Prototypen", mins: 12,
    body: [
      ["code", R`class Tier {
  #name;                     // privates Feld
  constructor(name) {
    this.#name = name;
  }
  get name() { return this.#name; }
  laut() { return "..."; }
  vorstellen() {
    return this.name + " sagt " + this.laut();
  }
}

class Hund extends Tier {
  laut() { return "Wuff"; }
}

console.log(new Hund("Bello").vorstellen()); // Bello sagt Wuff`],
      ["p", "Klassen sind in JavaScript eine elegantere Schreibweise für Prototypen: Jedes Objekt verweist auf ein Prototyp-Objekt, in dem nach fehlenden Eigenschaften gesucht wird. Das ist die Prototypkette."],
      ["p", "`extends` erbt, `super(...)` ruft den Elternkonstruktor auf, `#feld` ist wirklich privat, `get` definiert eine berechnete Eigenschaft und `static` gehört zur Klasse selbst statt zu ihren Instanzen."],
      ["tip", "Bevorzuge Komposition (Objekte enthalten andere Objekte) vor tiefen Vererbungsketten. Zwei bis drei Ebenen reichen fast immer."]
    ],
    quiz: [
      { q: "Was passiert bei `new Hund(\"Rex\").#name` außerhalb der Klasse?", opts: ["Gibt \"Rex\" zurück", "undefined", "SyntaxError", "Gibt \"...\" zurück"], a: 2, why: "Private Felder sind außerhalb der Klasse schon syntaktisch verboten." },
      { q: "Was bewirkt `super.laut()` in einer Methode von Hund?", opts: ["Ruft laut() der Elternklasse auf", "Ruft laut() doppelt auf", "Erzeugt ein neues Tier", "Ist nicht erlaubt"], a: 0, why: "`super` verweist auf die Methoden der Elternklasse." },
      { q: "Was wird ausgegeben?", code: R`class A { static info() { return "A"; } }
console.log(typeof new A().info);`, opts: ["\"function\"", "\"undefined\"", "\"string\"", "Fehler"], a: 1, why: "Statische Methoden gehören zur Klasse (`A.info`), nicht zu den Instanzen." }
    ],
    task: { prompt: "Ergänze die Klasse `Kreis` um einen Getter `umfang` (2 · π · r). `new Kreis(1).umfang.toFixed(2)` soll `6.28` ausgeben.", starter: R`class Kreis {
  constructor(r) {
    this.r = r;
  }
}

console.log(new Kreis(1).umfang.toFixed(2));
`, expect: "6.28" }
  }
  ]
};
