import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportWizard } from './import-wizard'

const CSV = `First Name,Last Name,Grad Year,Position,High School
Avery,Stone,2028,PG,Lakeview High School
Jordan,Mills,2029,SG,Northside Prep
Taylor,Reed,20X9,C,Westfield High School
Reese,Brooks,2028,PF,Riverbend Prep High School`

describe('ImportWizard', () => {
  it('goes upload -> map -> preview -> commit -> summary', async () => {
    const user = userEvent.setup()
    render(<ImportWizard />)
    const file = new File([CSV], 'sample.csv', { type: 'text/csv' })
    await user.upload(screen.getByLabelText(/choose a csv file/i), file)
    await screen.findByText(/5 columns found/)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByText('possible duplicates')
    expect(screen.getByText('Graduation year must be 4 digits')).toBeTruthy()
    await user.click(screen.getByLabelText('Create anyway'))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Import 3 recruits' }))
    await waitFor(() => expect(screen.getByText(/Import complete\. 3 recruits added/)).toBeTruthy(), { timeout: 3000 })
    expect(screen.getByRole('button', { name: /download skipped rows/i })).toBeTruthy()
  }, 10000)
})