import { lazy } from "react"

// cada modelo 3D só é baixado quando aparece na tela (cartão do processo ou ficha técnica)
export const MODELOS_3D = {
  carregadora: lazy(() => import("./Carregadora")),
  "mesa-corte": lazy(() => import("./MesaCorteCNC")),
  bilateral: lazy(() => import("./LapidadoraBilateral")),
  copo: lazy(() => import("./LapidadoraCopo")),
  furadeira: lazy(() => import("./Furadeira")),
  usinagem: lazy(() => import("./CentroUsinagem")),
  lavadora: lazy(() => import("./Lavadora")),
  "forno-eva": lazy(() => import("./FornoEVA")),
  laser: lazy(() => import("./LaserCNC")),
  "linha-jumbo": lazy(() => import("./LinhaCorteJumbo")),
  laminado: lazy(() => import("./CorteLaminado")),
  "corte-3em1": lazy(() => import("./Corte3em1")),
}

export type Modelo3D = keyof typeof MODELOS_3D
