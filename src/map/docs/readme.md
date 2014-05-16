The map directive creates a map on your page and loads a series of markers in it
The markers are loaded via a call to the API

**Api**

- api-url :   ( default : undefined ) defines the backend url to be called to load the markers.
             It expects a json array of objects having a "marker" property having the coordinates of the marker
             to be loaded in the map.
- marker-entity-name: ( default 'location' ) property whose value contains the coordinates of the marker position
- popup: &  scope function that defines the popup text to be shown in every marker point
- query:  ( default: {} ) model that allows filtering the markers to be added in a specific way
- mycenter: ( default {} ) model that allows to force the center of the map to a certain location
- width : ( default : '100%' ) of the map
- height : ( default : '100%' )  of the map

TODO

  - Remove dependency with Pager ( as a UI component it should only $emit events but never make use of $http or Pager )
  - Remove dependency with images and do not always overwrite them with "/bundles/undfmaps/images/map_user.png", "/bundles/undfmaps/images/map_pin.png"