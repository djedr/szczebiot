export const przytnij_drzewko = (drzewko) => {
  const {gałązki, etykieta} = drzewko

  const przycięte_gałązki = []

  for (const {etykieta, drzewko} of gałązki) {
    const przycięta = etykieta.trim()

    if (przycięta === 'komentarz') continue

    przycięte_gałązki.push({etykieta: przycięta, drzewko: przytnij_drzewko(drzewko)})
  }

  return {gałązki: przycięte_gałązki, etykieta: etykieta.trim()}
}