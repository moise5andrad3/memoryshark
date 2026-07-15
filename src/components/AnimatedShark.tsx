import type { CSSProperties } from 'react'

import type { Shark } from '../data/sharks'

interface AnimatedSharkProps {
  shark: Shark
}

type CartoonStyle = CSSProperties & {
  '--cartoon-accent': string
}

const BODY_PATHS: Record<string, string> = {
  megalodon:
    'M128 151C176 99 263 82 361 101C426 114 475 137 492 160C474 190 416 214 337 222C248 229 169 207 126 178Z',
  'great-white':
    'M127 153C177 109 260 94 355 108C418 117 468 139 491 159C470 183 416 201 346 208C254 218 175 201 126 176Z',
  'tiger-shark':
    'M127 151C180 105 266 91 359 107C424 118 470 140 489 160C466 186 412 207 342 213C250 220 171 202 125 176Z',
  'bull-shark':
    'M128 148C177 101 256 92 345 108C405 119 452 139 470 160C454 189 402 211 331 217C245 224 170 204 126 178Z',
  hammerhead:
    'M127 152C181 111 263 99 350 112C392 118 423 130 445 145L446 172C420 191 380 203 333 208C248 216 171 200 126 176Z',
  'whale-shark':
    'M127 150C177 103 261 88 357 101C425 110 473 132 494 155C503 166 493 179 478 188C446 207 393 219 334 221C245 224 169 203 125 177Z',
  'greenland-shark':
    'M126 154C180 117 269 104 365 116C424 123 468 140 486 159C464 181 410 197 343 203C250 211 171 198 125 176Z',
  sawshark:
    'M127 153C179 111 261 98 351 111C405 119 443 135 461 155L456 176C430 193 389 204 338 209C250 216 172 200 126 176Z',
}

const EYE_POSITIONS: Record<string, readonly [number, number]> = {
  hammerhead: [482, 139],
  sawshark: [427, 149],
  'bull-shark': [429, 147],
  'whale-shark': [454, 146],
}

export function AnimatedShark({ shark }: AnimatedSharkProps) {
  const bodyPath = BODY_PATHS[shark.id] ?? BODY_PATHS['great-white']
  const [eyeX, eyeY] = EYE_POSITIONS[shark.id] ?? [449, 146]

  return (
    <svg
      className="shark-cartoon"
      data-animated-shark
      data-motion={shark.motion}
      data-shark-id={shark.id}
      style={{ '--cartoon-accent': shark.accent } as CartoonStyle}
      viewBox="-30 -10 660 340"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g className="shark-cartoon__trajectory">
        <g className="shark-cartoon__speed-lines">
          <path d="M30 128H121" />
          <path d="M18 160H104" />
          <path d="M42 193H126" />
        </g>

        <g className="shark-cartoon__rig">
          <g
            className="shark-cartoon__rear-joint"
            data-part="rear-joint"
          >
            <path
              className="shark-cartoon__peduncle"
              d="M151 149C121 150 96 144 75 130L67 161L76 190C98 178 123 173 151 176Z"
            />
            <g className="shark-cartoon__tail-joint" data-part="tail">
              <path
                className="shark-cartoon__tail"
                d="M79 160C53 133 32 92 45 56C69 84 88 118 96 147C77 158 77 169 96 177C79 204 56 236 35 261C27 218 48 183 79 160Z"
              />
              <path
                className="shark-cartoon__tail-highlight"
                d="M76 150C62 128 51 105 50 80M76 171C59 190 49 214 45 236"
              />
            </g>
          </g>

          <g className="shark-cartoon__body-flex">
            <path
              className="shark-cartoon__dorsal-fin shark-cartoon__fin"
              data-part="fin"
              d="M241 112C257 78 284 50 318 43C310 75 313 98 325 108Z"
            />
            <path
              className="shark-cartoon__back-fin shark-cartoon__fin"
              d="M181 124C187 107 199 94 215 88C211 106 213 116 220 123Z"
            />

            <path
              className="shark-cartoon__body"
              data-part="body"
              d={bodyPath}
            />
            <path
              className="shark-cartoon__belly"
              d="M127 169C214 181 319 189 401 179C440 174 471 166 491 158C473 188 416 210 340 217C250 224 172 204 126 178Z"
            />

            <SpeciesFeatures sharkId={shark.id} />

            <g className="shark-cartoon__gills" aria-hidden="true">
              <path d="M390 143C382 151 381 162 387 171" />
              <path d="M399 141C391 151 390 164 397 174" />
              <path d="M408 141C401 152 401 164 407 173" />
            </g>

            {shark.id === 'hammerhead' && <HammerHead />}
            {shark.id === 'sawshark' && <SawRostrum />}

            <g className="shark-cartoon__face" data-part="face">
              <g className="shark-cartoon__eye" data-part="eye">
                <ellipse cx={eyeX} cy={eyeY} rx="8.5" ry="9.5" />
                <circle cx={eyeX + 2.5} cy={eyeY - 2.5} r="2.7" />
              </g>
              <circle
                className="shark-cartoon__nostril"
                cx={shark.id === 'sawshark' ? 448 : 475}
                cy="158"
                r="2.8"
              />
              <g className="shark-cartoon__jaw" data-part="jaw">
                <path
                  className="shark-cartoon__smile"
                  d={
                    shark.id === 'whale-shark'
                      ? 'M420 171Q454 195 486 167'
                      : shark.id === 'sawshark'
                        ? 'M404 172Q429 184 453 169'
                        : 'M421 171Q452 187 481 166'
                  }
                />
                {(shark.id === 'megalodon' ||
                  shark.id === 'great-white') && <Teeth />}
              </g>
            </g>

            <path
              className="shark-cartoon__far-fin shark-cartoon__fin"
              d="M282 192C270 224 273 248 292 264C306 231 310 209 306 191Z"
            />
            <path
              className="shark-cartoon__front-fin shark-cartoon__fin"
              data-part="fin"
              d="M324 187C328 226 350 246 384 257C376 221 363 197 347 181Z"
            />
          </g>

          <g className="shark-cartoon__character-bubbles">
            <circle cx="494" cy="122" r="8" />
            <circle cx="519" cy="101" r="5" />
            <circle cx="534" cy="77" r="3" />
          </g>
        </g>
      </g>
    </svg>
  )
}

function SpeciesFeatures({ sharkId }: { sharkId: string }) {
  if (sharkId === 'tiger-shark') {
    return (
      <g className="shark-cartoon__tiger-stripes">
        <path d="M202 116L220 153" />
        <path d="M236 106L252 151" />
        <path d="M273 102L284 149" />
        <path d="M311 103L316 149" />
        <path d="M347 108L347 151" />
        <path d="M381 116L376 154" />
      </g>
    )
  }

  if (sharkId === 'whale-shark') {
    return (
      <g className="shark-cartoon__whale-spots">
        <circle cx="192" cy="137" r="5" />
        <circle cx="222" cy="119" r="4" />
        <circle cx="250" cy="143" r="5" />
        <circle cx="279" cy="119" r="4" />
        <circle cx="307" cy="145" r="5" />
        <circle cx="338" cy="122" r="4" />
        <circle cx="365" cy="149" r="5" />
        <circle cx="396" cy="128" r="4" />
        <circle cx="425" cy="153" r="4" />
        <path d="M202 158H214M272 164H285M340 159H354M402 165H414" />
      </g>
    )
  }

  if (sharkId === 'greenland-shark') {
    return (
      <g className="shark-cartoon__greenland-marks">
        <ellipse cx="226" cy="137" rx="18" ry="8" />
        <ellipse cx="292" cy="122" rx="13" ry="6" />
        <ellipse cx="344" cy="153" rx="20" ry="7" />
        <path d="M258 181L281 169M314 186L332 173" />
      </g>
    )
  }

  if (sharkId === 'megalodon') {
    return (
      <g className="shark-cartoon__megalodon-scars">
        <path d="M270 123L258 151M285 126L273 154" />
        <path d="M341 190L356 178" />
      </g>
    )
  }

  return null
}

function HammerHead() {
  return (
    <g className="shark-cartoon__hammer-head" data-part="head">
      <path d="M421 137C445 128 461 119 482 116C501 113 522 120 531 133C516 142 501 148 483 151C501 154 511 164 514 177C496 183 477 178 465 168L430 173Z" />
      <ellipse cx="514" cy="132" rx="7" ry="8" />
      <circle cx="516" cy="130" r="2.3" />
    </g>
  )
}

function SawRostrum() {
  return (
    <g className="shark-cartoon__saw-rostrum" data-part="rostrum">
      <path d="M446 151L568 160L449 171Z" />
      <path d="M469 153L462 143M486 154L480 143M504 156L500 144M522 157L519 146M540 158L538 148M470 169L465 178M488 167L484 178M506 166L503 176M524 165L522 174M542 163L541 171" />
      <path className="shark-cartoon__barbels" d="M480 166L477 187M492 166L493 185" />
    </g>
  )
}

function Teeth() {
  return (
    <path
      className="shark-cartoon__teeth"
      d="M433 175L438 183L443 177L448 185L453 178L458 184L463 176L468 181L473 172"
    />
  )
}
