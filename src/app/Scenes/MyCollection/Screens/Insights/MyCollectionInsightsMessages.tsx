import { Message } from "palette"

interface MyCTabAddedArtworkHasNoInsightsMessageProps {
  onClose: () => void
}

export const MyCTabAddedArtworkHasNoInsightsMessage: React.FC<
  MyCTabAddedArtworkHasNoInsightsMessageProps
> = ({ onClose }) => {
  return (
    <Message
      variant="info"
      title="New artwork successfully added"
      text="There are no insights available for this artwork yet."
      onClose={onClose}
      showCloseButton
    />
  )
}

interface InsightsTabAddedArtworkHasNoInsightsMessageProps {
  onClose: () => void
}
export const InsightsTabAddedArtworkHasNoInsightsMessage: React.FC<
  InsightsTabAddedArtworkHasNoInsightsMessageProps
> = ({ onClose }) => {
  return (
    <Message
      variant="info"
      title="New artwork successfully added"
      text="There are currently no insights available on your collection. Insights will be shown here if they become available."
      onClose={onClose}
      showCloseButton
    />
  )
}

// the message is the same for both tabs
interface AddedArtworkHasInsightsMessageProps {
  onClose: () => void
}
export const AddedArtworkHasInsightsMessage: React.FC<AddedArtworkHasInsightsMessageProps> = ({
  onClose,
}) => {
  return (
    <Message
      variant="info"
      title="New artwork successfully added"
      text="Insights for your collection have been updated."
      onClose={onClose}
      showCloseButton
    />
  )
}
