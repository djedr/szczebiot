import { zinterpretuj_kod } from "./szczebiot.mjs";

const kod = `
zdefiniuj [[a] [5]]
zdefiniuj [[b] [10]]
szczebiocz [[a][b]]

komentarz [nieważne]
zdefiniuj [[f] funkcja [[[a][b]]
  dodaj [[a] pomnóż [[b][b]]]
]]
zdefiniuj [[silnia] funkcja [[n]
  warunkowo [
    równe? [[n] [1]] [1]
    pomnóż [[n] silnia [odejmij [[n] [1]]]]
  ]
]]
zdefiniuj [[liczba Fibonacciego] funkcja [[n]
  warunkowo [
    równe? [[n] [0]] [0]
    równe? [[n] [1]] [1]
    dodaj [
      liczba Fibonacciego [odejmij [[n][1]]]
      liczba Fibonacciego [odejmij [[n][2]]]
    ]
  ]
]]
szczebiocz [f [[a][b]]]
szczebiocz [silnia [20]]
szczebiocz [liczba Fibonacciego [10]]
`

zinterpretuj_kod(kod)