const otwieracz = "[", zamykacz = "]", uciekacz = "`"

export const zrób_drzewko_z_ciągu_znaków = (
  ciąg_znaków, 
  stan = {
    indeks_znaku: 0, 
    głębokość: 0,
  },
) => {
  const gałązki = []
  let etykieta = '', dwuznak = false
  for (; stan.indeks_znaku < ciąg_znaków.length; ++stan.indeks_znaku) {
    const znak = ciąg_znaków[stan.indeks_znaku]
    if (dwuznak) {
      if (znak === uciekacz || znak === otwieracz || znak === zamykacz) {
        etykieta += znak
        dwuznak = false
      } else throw SyntaxError(`Nieprawidłowy dwuznak (${uciekacz}${znak}) pod indeksem ${stan.indeks_znaku}!`)
    } else if (znak === uciekacz) {
      dwuznak = true
    } else if (znak === otwieracz) {
      stan.głębokość += 1
      stan.indeks_znaku += 1
      const drzewko = zrób_drzewko_z_ciągu_znaków(ciąg_znaków, stan)
      gałązki.push({etykieta, drzewko})
      etykieta = ''
    } else if (znak === zamykacz) {
      if (stan.głębokość < 1) throw SyntaxError(`Niespodziewany zamykacz (${zamykacz}) pod indeksem ${stan.indeks_znaku}!`)
      stan.głębokość -= 1
      return {gałązki, etykieta}
    } else etykieta += znak
  }
  if (dwuznak) throw SyntaxError(`Niespodziewany koniec po uciekaczu (${uciekacz})!`)
  if (stan.głębokość > 0) throw SyntaxError(`Niespodziewany koniec: brakuje ${stan.głębokość} zamykacz(a/y) (${zamykacz})!`)
  return {gałązki, etykieta}
}