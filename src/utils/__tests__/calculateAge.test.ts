import { describe, it, expect } from 'vitest'
import { calculateAge } from '../calculateAge'

describe('calculateAge', () => {
  it('beräknar ålder korrekt när födelsedag har passerat', () => {
    const birthDate = '1990-01-01'
    const age = calculateAge(birthDate)
    expect(age).toBeGreaterThanOrEqual(36)
  })

  it('beräknar ålder korrekt när födelsedag inte har passerat', () => {
    const today = new Date()
    const birthDate = new Date(today.getFullYear() - 25, today.getMonth() + 1, 15)
    
    const age = calculateAge(birthDate)
    expect(age).toBe(24) 
  })

  it('hanterar födelsedatum som Date-objekt', () => {
    const birthDate = new Date('2000-06-15')
    const age = calculateAge(birthDate)
    expect(age).toBeGreaterThanOrEqual(25)
  })

  it('hanterar dagens datum som födelsedatum', () => {
    const today = new Date()
    const age = calculateAge(today)
    expect(age).toBe(0)
  })
})
