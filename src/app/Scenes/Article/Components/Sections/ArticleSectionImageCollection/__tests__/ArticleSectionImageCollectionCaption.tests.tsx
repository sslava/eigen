import { screen, waitFor } from "@testing-library/react-native"
import { ArticleSectionImageCollectionCaptionTestQuery } from "__generated__/ArticleSectionImageCollectionCaptionTestQuery.graphql"
import { ArticleSectionImageCollectionCaption } from "app/Scenes/Article/Components/Sections/ArticleSectionImageCollection/ArticleSectionImageCollectionCaption"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { Suspense } from "react"
import { useLazyLoadQuery } from "react-relay"
import { graphql } from "relay-runtime"

describe("ArticleSectionImageCollectionCaption", () => {
  const Article = () => {
    const data = useLazyLoadQuery<ArticleSectionImageCollectionCaptionTestQuery>(
      graphql`
        query ArticleSectionImageCollectionCaptionTestQuery {
          article(id: "foo") {
            sections {
              ... on ArticleSectionImageCollection {
                figures {
                  ...ArticleSectionImageCollectionCaption_figure
                }
              }
            }
          }
        }
      `,
      {}
    )

    return <ArticleSectionImageCollectionCaption figure={data.article!.sections[0].figures?.[0]!} />
  }

  const { renderWithRelay } = setupTestWrapper({
    Component: () => (
      <Suspense fallback={null}>
        <Article />
      </Suspense>
    ),
  })

  it("renders", async () => {
    renderWithRelay({
      ArticleImageSection: () => ({
        __typename: "ArticleImageSection",
        caption: "Example Caption",
      }),
    })

    await waitFor(() => {
      expect(screen.getByText("Example Caption")).toBeOnTheScreen()
    })
  })
})
