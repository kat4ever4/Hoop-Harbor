import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NoteForm } from './note-form'
import { createNote } from './note-actions'

vi.mock('./note-actions', () => ({ createNote: vi.fn() }))
const staff = [
  { id: 'b2000000-0000-4000-8000-000000000004', display_name: 'Coach A' },
  { id: 'b2000000-0000-4000-8000-000000000005', display_name: 'Coach B' },
]
beforeEach(() => vi.clearAllMocks())

describe('NoteForm', () => {
  it('offers automatic attribution and both selected coaches, then resets after saving', async () => {
    vi.mocked(createNote).mockResolvedValue({ saved: true })
    render(<NoteForm recruitId="a2000000-0000-4000-8000-000000000001" staff={staff} />)
    const author = screen.getByRole('combobox', { name: 'Note author' })
    expect(author).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Automatic (your account)' })).toBeEnabled()
    expect(screen.getByRole('option', { name: 'Coach B' })).toBeInTheDocument()
    fireEvent.change(author, { target: { value: staff[0].id } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Great passing.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
    await screen.findByRole('status')
    expect(vi.mocked(createNote).mock.calls[0][1].get('author_id')).toBe(staff[0].id)
    expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('')
  })

  it('keeps the note and chosen coach when saving fails', async () => {
    vi.mocked(createNote).mockResolvedValue({ error: 'Could not save.' })
    render(<NoteForm recruitId="a2000000-0000-4000-8000-000000000001" staff={staff} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Note author' }), { target: { value: staff[1].id } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Keep this draft.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
    await screen.findByRole('alert')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save note' })).toBeEnabled())
    expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('Keep this draft.')
    expect(screen.getByRole('combobox', { name: 'Note author' })).toHaveValue(staff[1].id)
  })
})
