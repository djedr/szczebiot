import { zrób_drzewko_z_ciągu_znaków } from "./parser.mjs";
import { przytnij_drzewko } from "./przycinak.mjs";

export const zinterpretuj_kod = (kod) => {
  return jako_ciąg_wywołań(przytnij_drzewko(zrób_drzewko_z_ciągu_znaków(kod)), kontekst_początkowy)
}

const symbol_rodzica = Symbol.for('rodzic')
const zrób_kontekst = (rodzic) => new Map([
  [symbol_rodzica, rodzic],
])

const kontekst_początkowy = new Map([
  ['prawda', true],
  ['fałsz', false],
  ['', (drzewko, kontekst) => {
    const {gałązki, etykieta} = drzewko
    if (gałązki.length === 0) return zinterpretuj_etykietę(etykieta, kontekst)

    throw Error(`Niespodziewane gałązki!`)
  }],
  ['zdefiniuj', (drzewko, kontekst) => {
    const {nazwa, wartość} = jako_nazwa_i_wartość(drzewko, kontekst)
  
    if (kontekst.has(nazwa)) throw Error(`Nazwa '${nazwa}' już zdefiniowana!`)
    kontekst.set(nazwa, wartość)
  
    return wartość
  }],
  ['zmień!', (drzewko, kontekst) => {
    const {nazwa, wartość} = jako_nazwa_i_wartość(drzewko, kontekst)
  
    const kontekst_zawierający_nazwę = znajdź_kontekst_zawierający_nazwę(kontekst, nazwa)
    if (kontekst_zawierający_nazwę === undefined) throw Error(`Nieznana nazwa: '${nazwa}'!`)
  
    kontekst_zawierający_nazwę.set(nazwa, wartość)
  
    return wartość
  }],
  ['funkcja', (drzewko, kontekst_definicji) => {
    const {gałązki, etykieta} = drzewko
    if (etykieta !== '') throw Error(`Niespodziewana etykieta: ${etykieta}`)

    if (gałązki.length < 2) throw Error('Potrzebne parametry i ciało!')

    const parametry = gałązki[0]
    if (parametry.etykieta !== '') throw Error(`Niespodziewana etykieta parametrów: ${parametry.etykieta}!`)

    const nazwy_parametrów = []
    {
      const {drzewko} = parametry
      const {gałązki, etykieta} = drzewko

      if (gałązki.length === 0) {
        // cukier składniowy dla 0 and 1-argumentowych funkcji
        if (etykieta !== '') nazwy_parametrów.push(etykieta)
      } else {
        for (const gałązka of gałązki) {
          const nazwa = gałązka_jako_nazwa(gałązka)
          if (nazwy_parametrów.includes(nazwa)) throw Error('Powtórzona nazwa parametru!')
          nazwy_parametrów.push(nazwa)
        }
      }
    }

    const ciało = {gałązki: gałązki.slice(1), etykieta: ''}

    return {ciało, nazwy_parametrów, kontekst_definicji}
  }],
  ['szczebiocz', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    
    console.log(...wartości)

    return 'pusta wartość'
  }],
  ['blok', (drzewko, kontekst) => {
    const kontekst_bloku = zrób_kontekst(kontekst)
    return jako_ciąg_wywołań(drzewko, kontekst_bloku)
  }],
  ['warunkowo', (drzewko, kontekst) => {
    const {gałązki, etykieta} = drzewko
    if (etykieta !== '') throw Error(`Niespodziewana etykieta: ${etykieta}`)
    if (gałązki.length < 2) throw Error(`Powinny być co najmniej dwie gałązki, a jest ${gałązki.length}!`)

    const {length} = gałązki

    const jest_alternatywa = length % 2 === 1

    const długość = jest_alternatywa?
      length - 1:
      length

    for (let i = 0; i < długość; i += 2) {
      const warunek = gałązki[i]
      const konsekwencja = gałązki[i + 1]

      const wartość_warunku = zinterpretuj_gałązkę(warunek, kontekst)
      if (wartość_warunku === true) return zinterpretuj_gałązkę(konsekwencja, kontekst)

      if (wartość_warunku !== false) throw Error(`Wartość warunku niebooleanowska: ${wartość_warunku}`)
    }

    if (jest_alternatywa) {
      const alternatywa = gałązki.at(-1)

      return zinterpretuj_gałązkę(alternatywa, kontekst)
    }

    return 'pusta wartość'
  }],
  ['dodaj', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    if (wartości.some(v => typeof v !== 'number')) throw Error('Można dodawać tylko liczby!')
    let wartość = wartości[0]
    for (let i = 1; i < wartości.length; ++i) wartość += wartości[i]
    return wartość
  }],
  ['odejmij', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    if (wartości.some(v => typeof v !== 'number')) throw Error('Można odejmować tylko liczby!')
    let wartość = wartości[0]
    for (let i = 1; i < wartości.length; ++i) wartość -= wartości[i]
    return wartość
  }],
  ['pomnóż', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    if (wartości.some(v => typeof v !== 'number')) throw Error('Można mnożyć tylko liczby!')
    let wartość = wartości[0]
    for (let i = 1; i < wartości.length; ++i) wartość *= wartości[i]
    return wartość
  }],
  ['podziel', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    if (wartości.some(v => typeof v !== 'number')) throw Error('Można dzielić tylko liczby!')
    let wartość = wartości[0]
    for (let i = 1; i < wartości.length; ++i) wartość /= wartości[i]
    return wartość
  }],
  ['malejące?', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    if (wartości.some(v => typeof v !== 'number')) throw Error('Można porównywać tylko liczby!')
    let wartość = wartości[0]
    for (let i = 1; i < wartości.length; ++i) {
      if (wartość >= wartości[i]) return false
      wartość = wartości[i]
    }
    return true
  }],
  ['rosnące?', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    if (wartości.some(v => typeof v !== 'number')) throw Error('Można porównywać tylko liczby!')
    let wartość = wartości[0]
    for (let i = 1; i < wartości.length; ++i) {
      if (wartość <= wartości[i]) return false
      wartość = wartości[i]
    }
    return true
  }],
  ['równe?', (drzewko, kontekst) => {
    const wartości = jako_argumenty(drzewko, kontekst)
    let wartość = wartości[0]
    for (let i = 1; i < wartości.length; ++i) {
      if (wartość !== wartości[i]) return false
      wartość = wartości[i]
    }
    return true
  }],
])

const znajdź_kontekst_zawierający_nazwę = (kontekst, nazwa) => {
  while (true) {
    if (kontekst.has(nazwa)) return kontekst
    if (kontekst.has(symbol_rodzica)) kontekst = kontekst.get(symbol_rodzica)
    else return undefined
  }
}

const znajdź_wartość_w_kontekście = (etykieta, kontekst) => {
  while (true) {
    if (kontekst.has(etykieta)) return kontekst.get(etykieta)
    if (kontekst.has(symbol_rodzica)) kontekst = kontekst.get(symbol_rodzica)
    else return undefined
  }
}

// eval
const jako_ciąg_wywołań = (drzewko, kontekst) => {
  const {gałązki, etykieta} = drzewko

  if (gałązki.length === 0) {
    return zinterpretuj_etykietę(etykieta, kontekst)
  }

  if (etykieta !== '') throw Error(`Niespodziewana etykieta: ${etykieta}`)

  let wartość
  for (const gałązka of gałązki) {
    wartość = zinterpretuj_gałązkę(gałązka, kontekst)
  }

  return wartość
}

const zinterpretuj_etykietę = (etykieta, kontekst) => {
  if (etykieta === '') throw Error(`Niespodziewana pusta etykieta!`)

  // jako ciąg znaków
  if (etykieta.startsWith("'")) {
    if (etykieta.endsWith("'")) return etykieta.slice(1, -1)
    return etykieta.slice(1)
  }

  // jako liczbę
  if (etykieta === 'NaN') return NaN
  const liczba = +etykieta
  if (Number.isNaN(liczba) === false) return liczba

  // jako wartość w kontekście
  const wartość = znajdź_wartość_w_kontekście(etykieta, kontekst)
  if (wartość !== undefined) return wartość
  throw Error(`Nieznana etykieta: ${etykieta}`)
}

const zinterpretuj_gałązkę = ({etykieta, drzewko}, kontekst) => {
  const funkcja = znajdź_wartość_w_kontekście(etykieta, kontekst)
  if (funkcja === undefined) throw Error(`Nieznana funkcja: ${etykieta}`)
  if (typeof funkcja === 'function') return funkcja(drzewko, kontekst)

  return wywołaj_funkcję(funkcja, drzewko, kontekst)
}

// apply
const wywołaj_funkcję = (funkcja, drzewko_argumentów, kontekst_wywołania) => {
  const {ciało, nazwy_parametrów, kontekst_definicji} = funkcja
  const kontekst_lokalny = zrób_kontekst(kontekst_definicji)

  const {gałązki, etykieta} = drzewko_argumentów
  const {length} = gałązki
  if (nazwy_parametrów.length === 0) {
    if (length > 0 || etykieta !== '') throw Error(`Funkcja zero-argumentowa wywołana z ${length} argument(em/ami)!`)
  } else {
    if (nazwy_parametrów.length === 1) {
      if (length === 0 && etykieta === '') throw Error(`Funkcja jednoargumentowa wywołana bez argumentów!`)
    }

    const wartości_parametrów = jako_argumenty(drzewko_argumentów, kontekst_wywołania)
    
    if (wartości_parametrów.length !== nazwy_parametrów.length) throw Error(`Nieprawidłowa liczba argumentów: ${wartości_parametrów.length} zamiast ${nazwy_parametrów.length}`)

    for (let i = 0; i < nazwy_parametrów.length; ++i) {
      kontekst_lokalny.set(nazwy_parametrów[i], wartości_parametrów[i])
    }
  }

  return jako_ciąg_wywołań(ciało, kontekst_lokalny)
}


const gałązka_jako_nazwa = (gałązka) => {
  if (gałązka.etykieta !== '') throw Error('Niespodziewana etykieta!')
  const {drzewko} = gałązka
  if (drzewko.gałązki.length > 0) throw Error('Niespodziewane gałązki!')
  const {etykieta} = drzewko
  if (etykieta === '') throw Error('Niespodziewana pusta etykieta!')
  return etykieta
}

const jako_argumenty = (drzewko, kontekst) => {
  const {gałązki, etykieta} = drzewko

  // cukier składniowy dla funkcji jednoargumentowych
  if (gałązki.length === 0) {
    return [zinterpretuj_etykietę(etykieta, kontekst)]
  }

  if (etykieta !== '') throw Error(`Niespodziewana etykieta: ${etykieta}!`)

  const argumenty = []
  for (const gałązka of gałązki) {
    argumenty.push(zinterpretuj_gałązkę(gałązka, kontekst))
  }

  return argumenty
}

const jako_nazwa_i_wartość = (drzewko, kontekst) => {
  const {gałązki, etykieta} = drzewko
  if (etykieta !== '') throw Error(`Niespodziewana etykieta: ${etykieta}!`)
  
  const {length} = gałązki
  if (length !== 2) throw Error(`Wymagane 2 argumenty, nie ${length}!`)

  const gałązka_nazwy = gałązki[0]
  const gałązka_wartości = gałązki[1]
  const nazwa = gałązka_jako_nazwa(gałązka_nazwy, kontekst)
  const wartość = zinterpretuj_gałązkę(gałązka_wartości, kontekst)

  return {nazwa, wartość}
}
