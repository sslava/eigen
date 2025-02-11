import { captureMessage } from "@sentry/react-native"
import { isErrorStatus, throwError, trackError } from "app/system/relay/middlewares/helpers"
import { GraphQLRequest } from "app/system/relay/middlewares/types"
import { RelayNetworkLayerResponse } from "react-relay-network-modern/node8"
import { GraphQLSingularResponse } from "relay-runtime"

export const principalFieldErrorHandlerMiddleware = async (
  req: GraphQLRequest,
  res: RelayNetworkLayerResponse
) => {
  const resJson = res?.json as GraphQLSingularResponse
  const requestHasPrincipalField = req.operation.text?.includes("@principalField")

  // This represents whether or not the query experienced an error and that error was thrown while resolving
  // a field marked with the @principalField directive, or any sub-selection of such a field.
  const principalFieldWasInvolvedInError = isErrorStatus(
    resJson.extensions?.principalField?.httpStatusCode
  )

  // errors that are not from principalFields for tracking purposes maybe move to different middleware?
  if (!requestHasPrincipalField && !!res?.errors?.length) {
    // here we should track why the query failed + the error
    // FYI trackError is not sentry, its VolleyClient maybe we need BOTH
    trackError(req.operation.name, req.operation.kind, "default")
    captureMessage("query failed", "log")
    console.warn("Error reported to sentry and volley", res?.errors)
  }

  if (principalFieldWasInvolvedInError) {
    trackError(req.operation.name, req.operation.kind, "principalField")
    return throwError(req, res)
  } else {
    return res
  }
}
