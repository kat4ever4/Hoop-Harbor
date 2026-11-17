import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StaffPicker } from './staff-picker'
import { MOCK_STAFF } from '@/lib/staff/mock'

describe('StaffPicker', () => {
  it('starts with nothing chosen', () => {
    render(<StaffPicker staff={MOCK_STAFF} />)
    expect(screen.getByLabelText('Entered by')).toHaveValue('')
  })

  it('lists every staff name', () => {
    render(<StaffPicker staff={MOCK_STAFF} />)
    for (const s of MOCK_STAFF) expect(screen.getByRole('option', { name: s.display_name })).toBeInTheDocument()
  })

  it('reports the chosen id', () => {
    const onChange = vi.fn()
    render(<StaffPicker staff={MOCK_STAFF} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Entered by'), { target: { value: 'mock-dana' } })
    expect(onChange).toHaveBeenCalledWith('mock-dana')
  })

  it('sends the chosen id with the form under its name', () => {
    render(<form data-testid="f"><StaffPicker staff={MOCK_STAFF} name="changed_by_staff_id" /></form>)
    fireEvent.change(screen.getByLabelText('Entered by'), { target: { value: 'mock-robin' } })
    const data = new FormData(screen.getByTestId('f') as HTMLFormElement)
    expect(data.get('changed_by_staff_id')).toBe('mock-robin')
  })

  it('gives each picker its own label link', () => {
    render(<><StaffPicker staff={MOCK_STAFF} label="A" /><StaffPicker staff={MOCK_STAFF} label="B" /></>)
    expect(screen.getByLabelText('A')).not.toBe(screen.getByLabelText('B'))
  })

  it('shows a message when there are no staff', () => {
    render(<StaffPicker staff={[]} />)
    expect(screen.getByText(/No active staff names/)).toBeInTheDocument()
  })
})