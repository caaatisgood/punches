import { memo } from 'react'
import dynamic from 'next/dynamic'
// import p5Types from 'p5'

import { House } from '@/types'
import useKey from '@/utils/useKey'
import { Punch } from '@/store/userStore'

const P5Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
})

type SketchProps = {
  punches: Punch[] | undefined;
}

const COLOR_MAP: Record<House, string> = {
  erevald: "green",
  alterok: "blue",
  gaudmire: "yellow",
  spectreseek: "red",
}

const SEED = 577 // char code sum of `n&ws4_0`

let w: number, h: number
let wrange: number, hrange: number
let xrepeat: number = 66
let xbaseshift = 0, ybaseshift = 0
const max_h = 800
let margin = 12
const max_ticks = 100

const Sketch = ({ punches }: SketchProps) => {
  const [sketchKey, updateSketchKey] = useKey()
  let ticks = 0

  const _rerender = () => {
    ticks = 0
    updateSketchKey()
  }

  const setup = (p5: any) => {
    p5.randomSeed(SEED)
    h = max_h
    w = h / 1.61803398875
    const canvas = p5.createCanvas(w, h);
    canvas.parent("canvasWrapper");
    p5.pixelDensity(3)
    // p5.frameRate(16)
    p5.background(255);

    // configs
    wrange = w - margin * 2
    xbaseshift = margin
    const top_bottom_margin_unit = 4
    hrange = h - margin * 2 * top_bottom_margin_unit
    ybaseshift = margin * (top_bottom_margin_unit - 0.5)
    // xrepeat = p5.floor(p5.random([15, 30, 50, 60, 70, 80]))
  }

  const draw = (p5: any) => {
    if (!punches?.length || ticks >= punches.length || ticks >= max_ticks) {
      p5.noLoop()
      return
    }

    const strokeClr = COLOR_MAP[punches[ticks].house]

    let ybaseline = ticks * (hrange / (max_ticks + 1)) + p5.sin(ticks/5) * 17
    // let ybaseline = (noise(ticks/20)) * hrange
    p5.push()
      p5.translate(xbaseshift, ybaseshift + ybaseline)

      // ybaseline debug
      p5.push()
        p5.fill("tomato")
        p5.noStroke()
        // p5.ellipse(0, 0, 5)
      p5.pop()

      let xLen = wrange / xrepeat
      for (let i = 0; i < xrepeat; i++) {
        let x = i * xLen
        let ydelta = (p5.noise(ticks/5, i/5) - 0.5) * p5.sin(i/1) * 75
        let xLenDelta = (p5.noise(ticks/5, i/3) - 0.5) * (xLen * 1.66) * 0
        p5.push()
          p5.translate(x, ydelta)
          p5.rotate(p5.PI * (p5.noise(ticks/5, i/10) - 0.5) * 0.3)
          if (p5.random() < 0.05) {
          } else {
            if (p5.random() > 0.8) {
              p5.stroke(strokeClr)
            }
            p5.line(0, 0, xLen + xLenDelta, 0)
            for (let j = 1; j < 5; j++) {
              if (p5.random() > 0.95) {
                p5.line(0, j, xLen + xLenDelta, j)
              }
            }
          }
        p5.pop()
      }
    p5.pop()
    ticks++
  }

  return (
    <div key={sketchKey} onClick={_rerender}>
      <div id="canvasWrapper" />
      <P5Sketch setup={setup} draw={draw} />
    </div>
  )
}

export default memo(Sketch)
