import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'

/*
  Canvas-drawn textures for the ERP model: the dashboard screen, module cards
  and layer tags. Drawn in 2D once, uploaded as textures. Only real numbers
  appear (110 students, 25 staff, 20 modules); charts carry no values.
*/

const FONT = '"Geist Variable", "Segoe UI", system-ui, sans-serif'
const MONO = '"JetBrains Mono Variable", ui-monospace, monospace'

const C = {
  ink: '#0d0f0e',
  soft: '#5b625e',
  faint: '#9aa19c',
  paper: '#f7f8f5',
  line: '#e6e9e4',
  accent: '#0ea85f',
  accentSoft: '#d6f3e4',
  side: '#0f1512',
  warn: '#e8a33d',
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// Draw every texture at 2x and let mipmaps scale it down: crisp text at any zoom
const SUPERSAMPLE = 2

function make(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = w * SUPERSAMPLE
  canvas.height = h * SUPERSAMPLE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SUPERSAMPLE, SUPERSAMPLE)
  ctx.imageSmoothingQuality = 'high'
  draw(ctx)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.generateMipmaps = true
  tex.minFilter = LinearMipmapLinearFilter
  tex.magFilter = LinearFilter
  tex.anisotropy = 16 // clamped to the GPU's maximum by three.js
  return tex
}

/** Wait for the web fonts so the canvas text uses Geist, not a fallback. */
export async function fontsReady(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`600 40px ${FONT}`),
      document.fonts.load(`500 24px ${MONO}`),
    ])
  } catch {
    /* fall back to system fonts */
  }
}

export function dashboardTexture(): CanvasTexture {
  const W = 1280
  const H = 800
  return make(W, H, (ctx) => {
    rr(ctx, 0, 0, W, H, 36)
    ctx.fillStyle = C.paper
    ctx.fill()
    ctx.save()
    ctx.clip()

    // Sidebar
    ctx.fillStyle = C.side
    ctx.fillRect(0, 0, 230, H)
    ctx.fillStyle = C.accent
    rr(ctx, 32, 36, 40, 40, 10)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `600 26px ${FONT}`
    ctx.fillText('ERP', 86, 66)
    const menu = ['Dashboard', 'Students', 'Fees', 'Attendance', 'Exams', 'Finance', 'Reports', 'Settings']
    menu.forEach((m, i) => {
      const y = 140 + i * 62
      if (i === 0) {
        ctx.fillStyle = 'rgba(14,168,95,0.18)'
        rr(ctx, 18, y - 32, 194, 48, 12)
        ctx.fill()
      }
      ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,0.55)'
      ctx.font = `${i === 0 ? 600 : 500} 22px ${FONT}`
      ctx.fillText(m, 40, y)
    })

    // Top bar
    ctx.fillStyle = C.ink
    ctx.font = `600 34px ${FONT}`
    ctx.fillText('Dashboard', 270, 78)
    ctx.fillStyle = C.faint
    ctx.font = `500 20px ${MONO}`
    ctx.fillText('coaching-erp / overview', 272, 110)
    ctx.fillStyle = C.accentSoft
    rr(ctx, W - 250, 46, 210, 46, 23)
    ctx.fill()
    ctx.fillStyle = C.accent
    ctx.beginPath()
    ctx.arc(W - 222, 69, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = `600 19px ${FONT}`
    ctx.fillText('Role: Super admin', W - 205, 76)

    // KPI cards (real figures only)
    const kpis = [
      ['Students', '110'],
      ['Staff users', '25'],
      ['Modules', '20'],
    ]
    kpis.forEach(([label, value], i) => {
      const x = 270 + i * 330
      ctx.fillStyle = '#fff'
      rr(ctx, x, 150, 306, 150, 22)
      ctx.fill()
      ctx.fillStyle = C.soft
      ctx.font = `500 21px ${FONT}`
      ctx.fillText(label, x + 28, 196)
      ctx.fillStyle = C.ink
      ctx.font = `600 64px ${FONT}`
      ctx.fillText(value, x + 26, 270)
    })

    // Attendance chart card (shape only, no values)
    ctx.fillStyle = '#fff'
    rr(ctx, 270, 330, 560, 420, 22)
    ctx.fill()
    ctx.fillStyle = C.ink
    ctx.font = `600 24px ${FONT}`
    ctx.fillText('Attendance this week', 298, 380)
    ctx.fillStyle = C.faint
    ctx.font = `500 17px ${MONO}`
    ctx.fillText('ZKTeco sync', 298, 410)
    const bars = [0.72, 0.86, 0.8, 0.92, 0.78, 0.88]
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    bars.forEach((b, i) => {
      const bx = 310 + i * 84
      const bh = 260 * b
      ctx.fillStyle = i === 3 ? C.accent : C.accentSoft
      rr(ctx, bx, 700 - bh, 50, bh, 10)
      ctx.fill()
      ctx.fillStyle = C.faint
      ctx.font = `500 16px ${FONT}`
      ctx.fillText(days[i], bx + 8, 730)
    })

    // Fees table card
    ctx.fillStyle = '#fff'
    rr(ctx, 860, 330, 380, 420, 22)
    ctx.fill()
    ctx.fillStyle = C.ink
    ctx.font = `600 24px ${FONT}`
    ctx.fillText('Fee status', 888, 380)
    const rows: [string, string, boolean][] = [
      ['Roll 1021', 'Class 9', true],
      ['Roll 1034', 'Class 10', true],
      ['Roll 1047', 'Class 8', false],
      ['Roll 1052', 'Class 9', true],
      ['Roll 1066', 'HSC 1', false],
    ]
    rows.forEach(([roll, cls, paid], i) => {
      const y = 440 + i * 62
      ctx.fillStyle = C.line
      ctx.fillRect(888, y - 34, 324, 1)
      ctx.fillStyle = C.ink
      ctx.font = `500 19px ${MONO}`
      ctx.fillText(roll, 888, y)
      ctx.fillStyle = C.soft
      ctx.font = `500 18px ${FONT}`
      ctx.fillText(cls, 1018, y)
      ctx.fillStyle = paid ? C.accentSoft : '#fbecd3'
      rr(ctx, 1124, y - 24, 88, 32, 16)
      ctx.fill()
      ctx.fillStyle = paid ? C.accent : C.warn
      ctx.font = `600 16px ${FONT}`
      ctx.fillText(paid ? 'Paid' : 'Due', 1146, y - 2)
    })

    ctx.restore()
  })
}

export function moduleTexture(title: string, sub: string, glyph: string): CanvasTexture {
  const W = 560
  const H = 260
  return make(W, H, (ctx) => {
    // The card shows at roughly 130-160 px wide on screen, so the type is
    // large for its canvas (title 58px, subtitle 36px of a 260px-high card);
    // smaller text turned to mush once the texture was scaled down.
    rr(ctx, 0, 0, W, H, 40)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    const tile = 104
    const tileY = (H - tile) / 2
    ctx.fillStyle = C.accent
    rr(ctx, 32, tileY, tile, tile, 26)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `700 48px ${MONO}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(glyph, 32 + tile / 2, H / 2 + 2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    const x = 32 + tile + 28
    const maxW = W - x - 28
    ctx.fillStyle = C.ink
    ctx.font = `650 58px ${FONT}`
    ctx.fillText(title, x, 120, maxW)
    ctx.fillStyle = C.soft
    ctx.font = `500 36px ${FONT}`
    ctx.fillText(sub, x, 176, maxW)
  })
}

export function tagTexture(text: string): { tex: CanvasTexture; aspect: number } {
  const H = 96
  const probe = document.createElement('canvas').getContext('2d')!
  probe.font = `600 40px ${MONO}`
  const W = Math.ceil(probe.measureText(text).width + 96)
  const tex = make(W, H, (ctx) => {
    rr(ctx, 0, 0, W, H, H / 2)
    ctx.fillStyle = 'rgba(22,27,24,0.92)'
    ctx.fill()
    ctx.fillStyle = C.accent
    ctx.beginPath()
    ctx.arc(40, H / 2, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f4f5f2'
    ctx.font = `600 40px ${MONO}`
    ctx.fillText(text, 64, H / 2 + 14)
  })
  return { tex, aspect: W / H }
}
