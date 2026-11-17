import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DuplicateDialog } from './duplicate-dialog'

const matches = [{ id: 'j1', name: 'Jordan Smith', graduation_year: 2028, high_school: 'Westfield High School', stage: null }]

describe('DuplicateDialog', () => {
  it('lists each match with an Open existing link', () => {
    render(<form><DuplicateDialog matches={matches} pending={false} onClose={vi.fn()} /></form>)
    expect(screen.getByText('Jordan Smith')).toBeInTheDocument()
    expect(screen.getByText(/Class of 2028 · Westfield High School/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open existing' })).toHaveAttribute('href', '/recruits/j1')
  })

  it('submits the surrounding form with intent=force on Create anyway', () => {
    const onSubmit = vi.fn((e: SubmitEvent) => {
      e.preventDefault()
      const data = new FormData(e.target as HTMLFormElement, e.submitter)
      expect(data.get('intent')).toBe('force')
      expect(data.get('first_name')).toBe('Jordyn')
    })
    const { container } = render(
      <form>
        <input name="first_name" defaultValue="Jordyn" />
        <DuplicateDialog matches={matches} pending={false} onClose={vi.fn()} />
      </form>,
    )
    container.querySelector('form')!.addEventListener('submit', onSubmit)
    fireEvent.click(screen.getByRole('button', { name: 'Create anyway' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('disables Create anyway while saving', () => {
    render(<form><DuplicateDialog matches={matches} pending onClose={vi.fn()} /></form>)
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
  })
})