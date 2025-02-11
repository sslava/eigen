jest.mock("react-native-push-notification", () => ({
  requestPermissions: jest.fn(),
}))

jest.mock("app/utils/PushNotification", () => ({
  ...jest.requireActual("app/utils/PushNotification"),
  getNotificationPermissionsStatus: jest.fn(),
}))

import { __globalStoreTestUtils__ } from "app/store/GlobalStore"
import {
  PushAuthorizationStatus,
  getNotificationPermissionsStatus,
} from "app/utils/PushNotification"
import { requestPushNotificationsPermission } from "app/utils/requestPushNotificationsPermission"
import { Alert } from "react-native"

describe("requestPushNotificationsPermission", () => {
  let alertSpy: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    })

    alertSpy = jest.spyOn(Alert, "alert")
  })

  afterEach(() => {
    jest.runAllTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it("does not request push permissions if push permissions were requested this session", async () => {
    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushPermissionsRequestedThisSession: true,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.NotDetermined)

    const requestPushPromise = requestPushNotificationsPermission()

    jest.runAllTimers()
    jest.advanceTimersByTime(5000)

    await new Promise(setImmediate) // Wait for next tick in the JavaScript event loop
    await requestPushPromise

    expect(alertSpy).not.toHaveBeenCalled()
  })

  it("marks push requested this session after a request", async () => {
    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushPermissionsRequestedThisSession: false,
          pushNotificationDialogLastSeenTimestamp: undefined,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.NotDetermined)

    const requestPushPromise = requestPushNotificationsPermission()

    jest.runAllTimers()
    jest.advanceTimersByTime(5000)

    await requestPushPromise

    expect(alertSpy).toHaveBeenCalledWith(
      "Artsy Would Like to Send You Notifications",
      "Turn on notifications to get important updates about artists you follow.",
      [
        { text: "Not Now", style: "cancel", onPress: expect.any(Function) },
        { text: "OK", onPress: expect.any(Function) }, // we're just checking if it's a function
      ]
    )

    const pushRequestedThisSession =
      __globalStoreTestUtils__?.getCurrentState().artsyPrefs.pushPromptLogic
        .pushPermissionsRequestedThisSession

    expect(pushRequestedThisSession).toBe(true)
  })

  it("shows settings alert if push permissions are denied and they have seen the system prompt", async () => {
    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushPermissionsRequestedThisSession: false,
          pushNotificationSystemDialogSeen: true,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.Denied)

    await requestPushNotificationsPermission()

    expect(alertSpy).toHaveBeenCalledWith(
      "Artsy Would Like to Send You Notifications",
      "Turn on notifications to get important updates about artists you follow.",
      [
        { text: "Not Now", style: "cancel" },
        { text: "Settings", onPress: expect.any(Function) }, // we're just checking if it's a function
      ]
    )
  })

  it("does not show settings alert if seen before", async () => {
    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushPermissionsRequestedThisSession: false,
          pushNotificationSettingsPromptSeen: true,
          pushNotificationSystemDialogSeen: true,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.Denied)

    await requestPushNotificationsPermission()

    expect(alertSpy).not.toHaveBeenCalled()
  })

  it("marks settings alert as seen after showing", async () => {
    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushPermissionsRequestedThisSession: false,
          pushNotificationSettingsPromptSeen: false,
          pushNotificationSystemDialogSeen: true,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.Denied)

    await requestPushNotificationsPermission()

    expect(alertSpy).toHaveBeenCalledWith(
      "Artsy Would Like to Send You Notifications",
      "Turn on notifications to get important updates about artists you follow.",
      [
        { text: "Not Now", style: "cancel" },
        { text: "Settings", onPress: expect.any(Function) }, // we're just checking if it's a function
      ]
    )

    const pushSettingsAlertSeen =
      __globalStoreTestUtils__?.getCurrentState().artsyPrefs.pushPromptLogic
        .pushNotificationSettingsPromptSeen

    expect(pushSettingsAlertSeen).toBe(true)
  })

  it("shows the soft prompt if it has not been shown before", async () => {
    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushNotificationSystemDialogSeen: false,
          pushNotificationDialogLastSeenTimestamp: undefined,
          pushPermissionsRequestedThisSession: false,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.NotDetermined)

    const requestPushPromise = requestPushNotificationsPermission()

    jest.runAllTimers()
    jest.advanceTimersByTime(5000)

    await requestPushPromise

    // We're expecting the pre-prompt to show, so we can check if the Alert.alert has been called with the correct arguments
    expect(alertSpy).toHaveBeenCalledWith(
      "Artsy Would Like to Send You Notifications",
      "Turn on notifications to get important updates about artists you follow.",
      [
        { text: "Not Now", style: "cancel", onPress: expect.any(Function) },
        { text: "OK", onPress: expect.any(Function) },
      ]
    )
  })

  it("shows the soft prompt after it has been shown once if a week has passed", async () => {
    // Set the last seen date to more than a week ago
    const dateMoreThanAWeekAgo = new Date()
    dateMoreThanAWeekAgo.setDate(dateMoreThanAWeekAgo.getDate() - 8)

    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushNotificationSystemDialogSeen: false,
          pushNotificationDialogLastSeenTimestamp: dateMoreThanAWeekAgo.getTime(),
          pushPermissionsRequestedThisSession: false,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.NotDetermined)

    const requestPushPromise = requestPushNotificationsPermission()

    jest.runAllTimers()
    jest.advanceTimersByTime(5000)

    await requestPushPromise

    // We're expecting the pre-prompt to show, so we can check if the Alert.alert has been called with the correct arguments
    expect(alertSpy).toHaveBeenCalledWith(
      "Artsy Would Like to Send You Notifications",
      "Turn on notifications to get important updates about artists you follow.",
      [
        { text: "Not Now", style: "cancel", onPress: expect.any(Function) },
        { text: "OK", onPress: expect.any(Function) },
      ]
    )
  })

  it("does not show the soft prompt after it has been shown once and a week has NOT passed", async () => {
    // Set the last seen date to more than a week ago
    const dateLessThanAWeekAgo = new Date()
    dateLessThanAWeekAgo.setDate(dateLessThanAWeekAgo.getDate() - 5)

    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushNotificationSystemDialogSeen: false,
          pushNotificationDialogLastSeenTimestamp: dateLessThanAWeekAgo.getTime(),
          pushPermissionsRequestedThisSession: false,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.NotDetermined)

    const requestPushPromise = requestPushNotificationsPermission()

    jest.runAllTimers()
    jest.advanceTimersByTime(5000)

    await requestPushPromise

    expect(alertSpy).not.toHaveBeenCalled()
  })

  it("sets the pushNotificationDialogLastSeenDate to the current date after showing the pre-prompt", async () => {
    // Set the last seen date to more than a week ago
    const dateMoreThanAWeekAgo = new Date()
    dateMoreThanAWeekAgo.setDate(dateMoreThanAWeekAgo.getDate() - 8)

    __globalStoreTestUtils__?.injectState({
      artsyPrefs: {
        pushPromptLogic: {
          pushNotificationDialogLastSeenTimestamp: dateMoreThanAWeekAgo.getTime(),
          pushPermissionsRequestedThisSession: false,
        },
      },
    })

    const mockGetNotificationPermissionsStatus = getNotificationPermissionsStatus as jest.Mock
    mockGetNotificationPermissionsStatus.mockResolvedValue(PushAuthorizationStatus.NotDetermined)

    const currentDate = new Date("2023-05-23T00:00:00Z")
    Date.now = jest.fn().mockReturnValue(currentDate.getTime())

    const requestPushPromise = requestPushNotificationsPermission()

    jest.runAllTimers()
    jest.advanceTimersByTime(5000)

    await requestPushPromise

    // The pre-prompt alert should have been shown
    expect(alertSpy).toHaveBeenCalledWith(
      "Artsy Would Like to Send You Notifications",
      "Turn on notifications to get important updates about artists you follow.",
      [
        { text: "Not Now", style: "cancel", onPress: expect.any(Function) },
        { text: "OK", onPress: expect.any(Function) },
      ]
    )

    // Now check if the pushNotificationDialogLastSeenDate in GlobalStore was updated to the current date
    const pushNotificationDialogLastSeenTimestamp =
      __globalStoreTestUtils__?.getCurrentState().artsyPrefs.pushPromptLogic
        .pushNotificationDialogLastSeenTimestamp

    expect(pushNotificationDialogLastSeenTimestamp).toEqual(currentDate.getTime())
  })
})
