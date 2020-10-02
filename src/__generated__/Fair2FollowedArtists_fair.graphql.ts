/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type Fair2FollowedArtists_fair = {
    readonly slug: string;
    readonly followedArtistArtworks: {
        readonly edges: ReadonlyArray<{
            readonly artwork: {
                readonly id: string;
                readonly slug: string;
                readonly " $fragmentRefs": FragmentRefs<"ArtworkTileRailCard_artwork">;
            } | null;
        } | null> | null;
    } | null;
    readonly " $refType": "Fair2FollowedArtists_fair";
};
export type Fair2FollowedArtists_fair$data = Fair2FollowedArtists_fair;
export type Fair2FollowedArtists_fair$key = {
    readonly " $data"?: Fair2FollowedArtists_fair$data;
    readonly " $fragmentRefs": FragmentRefs<"Fair2FollowedArtists_fair">;
};



const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Fair2FollowedArtists_fair",
  "selections": [
    (v0/*: any*/),
    {
      "alias": "followedArtistArtworks",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 20
        },
        {
          "kind": "Literal",
          "name": "includeArtworksByFollowedArtists",
          "value": true
        }
      ],
      "concreteType": "FilterArtworksConnection",
      "kind": "LinkedField",
      "name": "filterArtworksConnection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "FilterArtworksEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": "artwork",
              "args": null,
              "concreteType": "Artwork",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
                (v0/*: any*/),
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ArtworkTileRailCard_artwork"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "filterArtworksConnection(first:20,includeArtworksByFollowedArtists:true)"
    }
  ],
  "type": "Fair",
  "abstractKey": null
};
})();
(node as any).hash = 'b3038830ea337b5e84dc4d2dbedaa623';
export default node;
