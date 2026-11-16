import { layers } from '../content/architecture'
import type { LayerId } from '../types/content'

/** Short codes for the layer rail and index; names and tech come from "How I build". */
export const layerCode: Record<LayerId, string> = {
  ui: 'UI',
  api: 'API',
  logic: 'LOGIC',
  data: 'DATA',
}

export const blogLayers = layers.map((l) => ({ id: l.id as LayerId, name: l.name, tech: l.tech, code: layerCode[l.id] }))

export const layerName = (id: LayerId) => blogLayers.find((l) => l.id === id)?.name ?? id

export const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00`))
