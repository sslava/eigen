import { __deprecated_mountWithWrappers, renderWithWrappers } from "lib/tests/renderWithWrappers"
import moment from "moment"
import { Sans } from "palette"
import React from "react"
import "react-native"

import { mockTimezone } from "lib/tests/mockTimezone"
import { Timer } from "../Timer"

import { BiddingThemeProvider } from "../BiddingThemeProvider"

const SECONDS = 1000
const MINUTES = 60 * SECONDS

const dateNow = 1525983752000 // Thursday, May 10, 2018 8:22:32.000 PM UTC in milliseconds

// @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
const getTimerLabel = (timerComponent) => timerComponent.root.findAllByType(Sans)[1].props.children

// @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
const getTimerText = (timerComponent) => timerComponent.root.findAllByType(Sans)[0].props.children

// @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
const getMountedTimerLabel = (timerComponent) => timerComponent.find(Sans).at(1).text()

// @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
const getMountedTimerText = (timerComponent) => timerComponent.find(Sans).at(0).text()

// @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
let pastTime
// @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
let futureTime

beforeEach(() => {
  jest.useFakeTimers()

  // Thursday, May 10, 2018 8:22:32.000 PM UTC
  Date.now = () => dateNow
  futureTime = moment(dateNow).add(1, "second").toISOString()

  pastTime = moment(dateNow).subtract(1, "second").toISOString()
})

const orgDateTimeFormat: any = Intl.DateTimeFormat

afterEach(() => {
  Intl.DateTimeFormat = orgDateTimeFormat
})

it("formats the remaining time in '00d  00h  00m  00s'", () => {
  let timer

  // Thursday, May 14, 2018 10:24:31.000 AM UTC
  timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-14T10:24:31+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerText(timer)).toEqual("03d  14h  01m  59s")

  // Thursday, May 10, 2018 8:42:32.000 PM UTC
  timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-10T20:42:32+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerText(timer)).toEqual("00d  00h  20m  00s")

  // Thursday, May 10, 2018 8:22:42.000 PM UTC
  timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-10T20:22:42+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerText(timer)).toEqual("00d  00h  00m  10s")
})

it("shows 'Ends' when it's an online-only sale with an ending time", () => {
  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-14T20:00:00+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toContain("Ends")
})

it("shows 'Live' when the liveStartsAt prop is given", () => {
  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer liveStartsAt="2018-05-14T20:00:00+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toContain("Live")
})

it("shows 'Starts' the sale has not started yet", () => {
  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer startsAt="2018-04-14T20:00:00+00:00" isPreview={true} liveStartsAt="2018-05-14T20:00:00+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toContain("Starts")
})

it("shows 'Bidding closed' when the auction is closed", () => {
  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer
        startsAt="2018-04-14T20:00:00+00:00"
        isPreview={false}
        liveStartsAt="2018-05-14T20:00:00+00:00"
        isClosed={true}
      />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toContain("Bidding closed")
})

it("shows 'In progress' when the auction is in live auction integration mode", () => {
  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer
        startsAt="2018-04-14T20:00:00+00:00"
        isPreview={false}
        liveStartsAt={
          // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
          pastTime
        }
        isClosed={false}
      />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toContain("In progress")
})

it("counts down to zero", () => {
  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-14T10:23:10+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerText(timer)).toEqual("03d  14h  00m  38s")

  jest.advanceTimersByTime(2 * SECONDS)

  expect(getTimerText(timer)).toEqual("03d  14h  00m  36s")

  jest.advanceTimersByTime(1 * MINUTES)

  expect(getTimerText(timer)).toEqual("03d  13h  59m  36s")
})

it("shows month, date, and hour adjusted for the timezone where the user is", () => {
  mockTimezone("America/Los_Angeles")

  // Thursday, May 14, 2018 8:00:00.000 PM UTC
  // Thursday, May 14, 2018 1:00:00.000 PM PDT in LA
  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-14T20:00:00+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toEqual("Ends May 14, 1 PM PDT")
})

it("displays the minutes when the sale does not end on the hour", () => {
  mockTimezone("America/New_York")

  let timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-14T20:01:00+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toEqual("Ends May 14, 4:01 PM EDT")

  timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-14T20:30:00+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toEqual("Ends May 14, 4:30 PM EDT")
})

it("omits the minutes when the sale ends on the hour", () => {
  mockTimezone("America/New_York")

  const timer = renderWithWrappers(
    <BiddingThemeProvider>
      <Timer endsAt="2018-05-14T20:00:00+00:00" />
    </BiddingThemeProvider>
  )

  expect(getTimerLabel(timer)).toEqual("Ends May 14, 4 PM EDT")
})

describe("timer transitions", () => {
  it("transitions state from preview --> closing when the timer ends", () => {
    // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
    const timer = __deprecated_mountWithWrappers(<Timer isPreview={true} startsAt={futureTime} endsAt={futureTime} />)

    expect(getMountedTimerLabel(timer)).toContain("Starts")
    expect(getMountedTimerText(timer)).toEqual("00d  00h  00m  01s")

    jest.advanceTimersByTime(1 * SECONDS)

    expect(getMountedTimerLabel(timer)).toContain("Ends")
    expect(getMountedTimerText(timer)).toEqual("00d  00h  00m  01s")
  })

  it("transitions state from preview --> live upcoming when the timer ends", () => {
    const timer = __deprecated_mountWithWrappers(
      // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
      <Timer isPreview={true} startsAt={futureTime} liveStartsAt={futureTime} />
    )

    expect(getMountedTimerLabel(timer)).toContain("Starts")
    expect(getMountedTimerText(timer)).toEqual("00d  00h  00m  01s")

    jest.advanceTimersByTime(1 * SECONDS)

    expect(getMountedTimerLabel(timer)).toContain("Live")
    expect(getMountedTimerText(timer)).toEqual("00d  00h  00m  01s")
  })

  it("transitions state from live upcoming --> live ongoing when the timer ends", () => {
    const timer = __deprecated_mountWithWrappers(
      // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
      <Timer isPreview={false} startsAt={pastTime} liveStartsAt={futureTime} />
    )

    expect(getMountedTimerLabel(timer)).toContain("Live")
    expect(getMountedTimerText(timer)).toEqual("00d  00h  00m  01s")

    jest.advanceTimersByTime(1 * SECONDS)

    expect(getMountedTimerLabel(timer)).toContain("In progress")
    expect(getMountedTimerText(timer)).toContain("00d  00h  00m")
  })

  it("transitions state from closing --> closed when the timer ends", () => {
    // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
    const timer = __deprecated_mountWithWrappers(<Timer isPreview={false} startsAt={pastTime} endsAt={futureTime} />)

    expect(getMountedTimerLabel(timer)).toContain("Ends")
    expect(getMountedTimerText(timer)).toEqual("00d  00h  00m  01s")

    jest.advanceTimersByTime(1 * SECONDS)

    expect(getMountedTimerLabel(timer)).toContain("Bidding closed")
    expect(getMountedTimerText(timer)).toContain("00d  00h  00m")
  })
})
