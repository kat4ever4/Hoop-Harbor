import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddNote } from './add-note'
import { MOCK_STAFF } from '@/lib/staff/mock'

const setup = (addNote = vi.fn()) =>
  render(<AddNote recruitId="r1" staff={MOCK_STAFF} pickAuthor addNote={addNote} onSaved={vi.fn()} />)

describe('AddNote', () => {
  it('keeps Save disabled until there is text and a staff name', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /add note/i }))
    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Strong on-ball defense' } })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Entered by'), { target: { value: 'mock-dana' } })
    expect(save).toBeEnabled()
  })

  it('keeps the text and offers Retry with the same receipt when the save throws', async () => {
    const addNote = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
    setup(addNote)
    fireEvent.click(screen.getByRole('button', { name: /add note/i }))
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Offline note' } })
    fireEvent.change(screen.getByLabelText('Entered by'), { target: { value: 'mock-dana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getByText(/Not saved/)).toBeInTheDocument())
    expect(screen.getByLabelText('Note')).toHaveValue('Offline note')

    addNote.mockResolvedValueOnce({ ok: true, note: { id: 'n1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(addNote).toHaveBeenCalledTimes(2))

    const first = (addNote.mock.calls[0][0] as FormData).get('client_request_id')
    const second = (addNote.mock.calls[1][0] as FormData).get('client_request_id')
    expect(second).toBe(first)
  })
})