import {createContext} from 'react'
import type {PetState} from '../../types'
export const JourneyPetContext=createContext<PetState|null>(null)
