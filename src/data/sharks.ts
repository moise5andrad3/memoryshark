import bullSharkAudio from '../assets/audio/bull-shark.mp3'
import greatWhiteAudio from '../assets/audio/great-white.mp3'
import greenlandSharkAudio from '../assets/audio/greenland-shark.mp3'
import hammerheadAudio from '../assets/audio/hammerhead.mp3'
import megalodonAudio from '../assets/audio/megalodon.mp3'
import sawsharkAudio from '../assets/audio/sawshark.mp3'
import tigerSharkAudio from '../assets/audio/tiger-shark.mp3'
import whaleSharkAudio from '../assets/audio/whale-shark.mp3'
import bullSharkImage from '../assets/sharks/webp/bull-shark.webp'
import greatWhiteImage from '../assets/sharks/webp/great-white.webp'
import greenlandSharkImage from '../assets/sharks/webp/greenland-shark.webp'
import hammerheadImage from '../assets/sharks/webp/hammerhead.webp'
import megalodonImage from '../assets/sharks/webp/megalodon.webp'
import sawsharkImage from '../assets/sharks/webp/sawshark.webp'
import tigerSharkImage from '../assets/sharks/webp/tiger-shark.webp'
import whaleSharkImage from '../assets/sharks/webp/whale-shark.webp'

export type CelebrationMotion =
  | 'power-glide'
  | 'bright-breach'
  | 'tiger-swerve'
  | 'bull-charge'
  | 'hammer-scan'
  | 'gentle-giant'
  | 'ancient-drift'
  | 'saw-swish'

export interface Shark {
  id: string
  name: string
  shortName: string
  image: string
  audio: string
  fact: string
  cheer: string
  accent: string
  motion: CelebrationMotion
}

export const SHARKS: readonly Shark[] = [
  {
    id: 'megalodon',
    name: 'Megalodonte',
    shortName: 'Megalodonte',
    image: megalodonImage,
    audio: megalodonAudio,
    fact: 'Seus dentes podiam chegar a 18 centímetros — quase o tamanho de uma mão adulta!',
    cheer: 'Que mergulho gigante!',
    accent: '#ff6b6b',
    motion: 'power-glide',
  },
  {
    id: 'great-white',
    name: 'Tubarão-branco',
    shortName: 'Branco',
    image: greatWhiteImage,
    audio: greatWhiteAudio,
    fact: 'Ele consegue manter o corpo mais quente que a água ao redor.',
    cheer: 'Salto perfeito!',
    accent: '#277da1',
    motion: 'bright-breach',
  },
  {
    id: 'tiger-shark',
    name: 'Tubarão-tigre',
    shortName: 'Tigre',
    image: tigerSharkImage,
    audio: tigerSharkAudio,
    fact: 'Quando ele cresce, suas listras ficam mais fraquinhas.',
    cheer: 'Listras em movimento!',
    accent: '#f8961e',
    motion: 'tiger-swerve',
  },
  {
    id: 'bull-shark',
    name: 'Tubarão-touro',
    shortName: 'Touro',
    image: bullSharkImage,
    audio: bullSharkAudio,
    fact: 'Ele pode nadar no mar e também entrar em rios de água doce.',
    cheer: 'Força total!',
    accent: '#f3722c',
    motion: 'bull-charge',
  },
  {
    id: 'hammerhead',
    name: 'Tubarão-martelo',
    shortName: 'Martelo',
    image: hammerheadImage,
    audio: hammerheadAudio,
    fact: 'A cabeça de martelo sente sinais elétricos de animais escondidos na areia.',
    cheer: 'Radar ligado!',
    accent: '#43aa8b',
    motion: 'hammer-scan',
  },
  {
    id: 'whale-shark',
    name: 'Tubarão-baleia',
    shortName: 'Baleia',
    image: whaleSharkImage,
    audio: whaleSharkAudio,
    fact: 'É o maior peixe vivo e come filtrando bichinhos minúsculos da água.',
    cheer: 'O gigante gentil chegou!',
    accent: '#4d90d8',
    motion: 'gentle-giant',
  },
  {
    id: 'greenland-shark',
    name: 'Tubarão-da-Groenlândia',
    shortName: 'Groenlândia',
    image: greenlandSharkImage,
    audio: greenlandSharkAudio,
    fact: 'Cientistas estimam que ele pode viver pelo menos 250 anos!',
    cheer: 'O sábio do gelo!',
    accent: '#577590',
    motion: 'ancient-drift',
  },
  {
    id: 'sawshark',
    name: 'Tubarão-serra',
    shortName: 'Serra',
    image: sawsharkImage,
    audio: sawsharkAudio,
    fact: 'Os dois “bigodes” da serra ajudam a achar peixinhos escondidos no fundo.',
    cheer: 'Serra em ação!',
    accent: '#90be6d',
    motion: 'saw-swish',
  },
]

export const SHARK_BY_ID = Object.fromEntries(
  SHARKS.map((shark) => [shark.id, shark]),
) as Record<string, Shark>
