import { Flex, Spacer, Text, Touchable } from "@artsy/palette-mobile"
import { Articles_articles$key } from "__generated__/Articles_articles.graphql"
import { Articles_artist$key } from "__generated__/Articles_artist.graphql"
import { MasonryStatic } from "app/Components/MasonryStatic"
import { navigate } from "app/system/navigation/navigate"
import { Dimensions } from "react-native"
import { useFragment, graphql } from "react-relay"
import { Article } from "./Article"

interface Props {
  articles: Articles_articles$key
  artist: Articles_artist$key
}

export const Articles: React.FC<Props> = ({ articles, artist }) => {
  const articlesData = useFragment(articlesQuery, articles)
  const artistData = useFragment(artistQuery, artist)

  return (
    <Flex>
      <Flex flexDirection="row" justifyContent="space-between">
        <Text variant="sm-display">{`Artsy Editorial Featuring ${artistData.name}`}</Text>
        <Touchable onPress={() => navigate(`artist/${artistData.slug}/articles`)}>
          <Text variant="xs" underline>
            View All
          </Text>
        </Touchable>
      </Flex>

      <Spacer y={4} />

      <Article article={articlesData[0]} headline />

      <Spacer y={2} />

      <Flex flex={1} flexShrink={0} flexGrow={1}>
        <MasonryStatic
          data={articlesData.slice(1, articlesData.length)}
          renderItem={({ item }) => <Article article={item} />}
          columnSeparator={() => <Spacer x={2} />}
          numColumns={Dimensions.get("window").width > 700 ? 3 : 2}
          columnKey="articles"
        />
      </Flex>
    </Flex>
  )
}

const articlesQuery = graphql`
  fragment Articles_articles on Article @relay(plural: true) {
    internalID
    ...ArticleCard_article
    ...Articles_article
  }
`

const artistQuery = graphql`
  fragment Articles_artist on Artist {
    name
    slug
  }
`
