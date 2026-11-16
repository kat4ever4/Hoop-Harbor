import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import type { RecruitStatus } from '@/lib/status/types'
import { StatusSection } from './status-section'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  stage: vi.fn(),
  usna: vi.fn(),
  outsideOffer: vi.fn(),
  visit: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}))

vi.mock('@/app/recruits/recruiting-actions', () => ({
  changeRecruitStage: mocks.stage,
  saveUsnaOffer: mocks.usna,
  createOutsideOffer: mocks.outsideOffer,
  createRecruitVisit: mocks.visit,
}))

const recruitId = 'a2000000-0000-4000-8000-000000000001'
const staffId = 'b2000000-0000-4000-8000-000000000001'

const status: RecruitStatus = {
  pipeline_stage: 'identified',
  stage_changed_at: null,
  stage_changed_by: null,
  usna_offer_date: null,
  usna_offered_by: null,
  other_offers: [],
  visits: [],
}

function setup() {
  return render(
    <StatusSection
      recruitId={recruitId}
      status={status}
      staff={[{
        id: staffId,
        display_name: 'Test Coach',
      }]}
      schoolNames={['Army West Point']}
    />
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  mocks.stage.mockResolvedValue({ success: true })
  mocks.usna.mockResolvedValue({ success: true })
  mocks.outsideOffer.mockResolvedValue({
    success: true,
    id: 'o1',
  })
  mocks.visit.mockResolvedValue({
    success: true,
    id: 'v1',
  })
})

describe('F3 recruiting status integration', () => {
  it('saves a pipeline stage', async () => {
    setup()

    fireEvent.click(
      screen.getByRole('button', { name: 'Change stage' })
    )

    const selects = screen.getAllByRole('combobox')

    fireEvent.change(selects[0], {
      target: { value: 'priority' },
    })

    fireEvent.change(selects[1], {
      target: { value: staffId },
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Save' })
    )

    await waitFor(() => {
      expect(mocks.stage).toHaveBeenCalledWith(
        recruitId,
        'priority',
        staffId
      )
    })

    await waitFor(() => {
      expect(mocks.refresh).toHaveBeenCalledTimes(1)
    })
  })

  it('shows an error when stage saving fails', async () => {
    mocks.stage.mockResolvedValueOnce({
      success: false,
      error: 'Not permitted',
    })

    setup()

    fireEvent.click(
      screen.getByRole('button', { name: 'Change stage' })
    )

    const selects = screen.getAllByRole('combobox')

    fireEvent.change(selects[0], {
      target: { value: 'priority' },
    })

    fireEvent.change(selects[1], {
      target: { value: staffId },
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Save' })
    )

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Not permitted')

    expect(mocks.refresh).not.toHaveBeenCalled()
  })

  it('saves a USNA offer', async () => {
    const { container } = setup()

    fireEvent.click(
      screen.getByRole('button', {
        name: /add usna offer/i,
      })
    )

    const date = container.querySelector<HTMLInputElement>(
      'input[type="date"]'
    )!

    fireEvent.change(date, {
      target: { value: '2026-11-16' },
    })

    fireEvent.change(
      screen.getByRole('combobox'),
      { target: { value: staffId } }
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Save' })
    )

    await waitFor(() => {
      expect(mocks.usna).toHaveBeenCalledWith({
        recruitId,
        staffId,
        offerDate: '2026-11-16',
      })
    })
  })

  it('saves another school offer', async () => {
    const { container } = setup()

    fireEvent.click(
      screen.getByRole('button', { name: /add offer/i })
    )

    fireEvent.change(
      screen.getByPlaceholderText(
        'e.g. University of Connecticut'
      ),
      { target: { value: 'Army West Point' } }
    )

    const date = container.querySelector<HTMLInputElement>(
      'input[type="date"]'
    )!

    fireEvent.change(date, {
      target: { value: '2026-11-16' },
    })

    fireEvent.change(
      screen.getByPlaceholderText(
        'e.g. Twitter, AAU coach'
      ),
      { target: { value: 'Coach' } }
    )

    fireEvent.change(
      screen.getByRole('combobox'),
      { target: { value: staffId } }
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Save Offer' })
    )

    await waitFor(() => {
      expect(mocks.outsideOffer).toHaveBeenCalledWith({
        recruitId,
        staffId,
        schoolName: 'Army West Point',
        dateLearned: '2026-11-16',
        source: 'Coach',
      })
    })
  })

  it('saves a visit', async () => {
    const { container } = setup()

    fireEvent.click(
      screen.getByRole('button', { name: /add visit/i })
    )

    const selects = screen.getAllByRole('combobox')

    fireEvent.change(selects[0], {
      target: { value: 'official' },
    })

    const date = container.querySelector<HTMLInputElement>(
      'input[type="date"]'
    )!

    fireEvent.change(date, {
      target: { value: '2026-11-16' },
    })

    fireEvent.change(selects[2], {
      target: { value: staffId },
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Save Visit' })
    )

    await waitFor(() => {
      expect(mocks.visit).toHaveBeenCalledWith({
        recruitId,
        staffId,
        visitType: 'official',
        visitDate: '2026-11-16',
        status: 'planned',
      })
    })
  })
})
