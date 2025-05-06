import recyclableIcon from 'assets/classification-icons/Icon.svg'
import organicIcon from 'assets/classification-icons/compost.svg'
import trashIcon from 'assets/classification-icons/delete.svg'
import eletronicIcon from 'assets/classification-icons/devices_other.svg'
import nonRecyclableIcon from 'assets/classification-icons/report.svg'
import paperIcon from 'assets/classification-icons/note_stack.svg'
import glassIcon from 'assets/classification-icons/glass_cup.svg'
import plasticIcon from 'assets/classification-icons/water_bottle.svg'
import metalIcon from 'assets/classification-icons/attachment.svg'
import woodIcon from 'assets/classification-icons/forest.svg'
import undefinedIcon from 'assets/classification-icons/help.svg'
import type { Map } from '#build/interfaces/Map'

export function categories(tag: string) {
  const icon: Map = {
    organic: organicIcon,
    compostable: organicIcon,
    recyclable: recyclableIcon,
    trash: trashIcon,
    non_recyclable: nonRecyclableIcon,
    paper: paperIcon,
    glass: glassIcon,
    plastic: plasticIcon,
    metal: metalIcon,
    eletronic: eletronicIcon,
    wood: woodIcon,
    undefined: undefinedIcon,
  }

  const colors: Map = {
    recyclable: '#C4E7FF',
    organic: '#3EBF9E',
    compostable: '#3EBF9E',
    trash: '#E1E2E5',
    non_recyclable: '#FF897D',
    paper: '#BFF2F6',
    glass: '#FEE1A9',
    plastic: '#FFAAC1',
    wood: '#935414',
    metal: '#B6B6B6',
    eletronic: '#B37BCC',
    undefined: '#E1E2E5',
  }

  const obj = {
    icon: icon[tag],
    color: colors[tag],
  }

  return obj
}
