/**
 * Map Directive. TODO move to ui.atomic.map
 *
 */
angular.module('ui.atomic.map', ['leaflet-directive', 'ui.atomic.pager'])
/**
 *  @description
 *  The map directive creates a map on your page and loads a series of markers in it
 *  The markers are loaded via a call to the API
 *
 *  Api:
 *    - api-url :   ( default : undefined ) defines the backend url to be called to load the markers.
 *                  It expects a json array of objects having a "marker" property having the coordinates of the marker
 *                  to be loaded in the map.
 *    - marker-entity-name: ( default 'location' ) property whose value contains the coordinates of the marker position
 *    - popup: &  scope function that defines the popup text to be shown in every marker point
 *    - query:  ( default: {} ) model that allows filtering the markers to be added in a specific way
 *    - mycenter: ( default {} ) model that allows to force the center of the map to a certain location
 *
 */
    .directive('map', ['Pager', function (Pager) {
        'use strict';
        return {
            restrict: 'C',
            scope: {
                popup: '&',
                query: "=apiQuery",
                mycenter: '='
            },
            templateUrl : 'template/map/map.html',
            controller: ['$scope', '$attrs', '$timeout', 'leafletData', '$rootScope', function ($scope, $attrs, $timeout, leafletData, $rootScope) {
                //Initialize the api pager
                var timeoutId,
                    url = $attrs.apiUrl,
                    markerEntityName = $attrs.markerEntityName || 'location';

                $scope.query = $scope.query || {};

                //Configure the leaflet directive
                angular.extend($scope, {
                    width: $attrs.width || '100%',
                    height: $attrs.height || '100%',
                    markers: [],
                    defaults: {
                        maxZoom: $attrs.maxZoom || 18,
                        timeout: 30000
                    },
                    layers: {
                        baselayers: {
                            googleRoadmap: {
                                name: 'Google Streets',
                                layerType: 'ROADMAP',
                                type: 'google'
                            },
                            googleHybrid: {
                                name: 'Google Hybrid',
                                layerType: 'HYBRID',
                                type: 'google'
                            }
                        }
                    }
                });

                if ($scope.mycenter) {
                    $scope.center = $scope.mycenter;
                    loadMap();
                    return;
                } else {
                    $scope.center = {
                        autoDiscover: true,
                        zoom: parseInt($attrs.zoom) || 16
                    };
                }

                // Search Events
                $rootScope.$on('searchEvent.SEARCH_CHANGE', function (event, value, params) {
                    angular.extend($scope.query, params);
                    loadMap();
                });

                $rootScope.$on('filterEvent.SEARCH_CHANGE', function (event, value, params) {
                    angular.extend($scope.query, params);
                    loadMap();
                });

                //Function to initialize de map
                function loadMap() {
                    var lat = $rootScope.currentPosition ? $rootScope.currentPosition.lat : 41.3975834,
                        lng = $rootScope.currentPosition ? $rootScope.currentPosition.lng : 2.1907346;
                    //Extend query params in order to filter by distance
                    angular.extend($scope.query, {
                        orderBy: {
                            lat: lat,
                            lng: lng
                        },
                        orderDir: 'ASC'
                    });
                    $scope.pager = new Pager(url, $scope.query, function (item) {
                        var markerExtend = {
                            distance: item.distance,
                            icon: {
                                iconUrl: '/bundles/undfmaps/images/map_pin.png'
                            }
                        };
                        if (angular.isFunction($scope.popup())) {
                            markerExtend.message = $scope.popup()(item[markerEntityName]);
                        }

                        return angular.extend(item[markerEntityName], markerExtend);
                    });

                    //Iteratively request all result pages till every
                    //single marker is on the map.
                    (function loadMarkers() {
                        $scope.pager.nextPage(function () {
                            timeoutId = $timeout(loadMarkers, 100);
                        });
                    })();

                    $scope.markers = $scope.pager.results;
                    if ($rootScope.currentPosition) {
                        $scope.markers.push({
                            lat: $rootScope.currentPosition.lat,
                            lng: $rootScope.currentPosition.lng,
                            icon: {
                                iconUrl: '/bundles/undfmaps/images/map_user.png',
                                iconSize: [25, 25],
                                shadowSize: [5, 5],
                                shadowAnchor: [5, 5]
                            }
                        });
                    }
                }

                if ($rootScope.currentPosition || $rootScope.isGeoLocationInactive) {
                    if ($rootScope.isGeoLocationInactive) {
                        //Reinitiate the center position in Barcelona
                        $scope.center = {
                            lat: 41.385052,
                            lng: 2.173233,
                            zoom: parseInt($attrs.zoom) || 16
                        };
                    }
                    loadMap();
                }

                //Center the map on the current position (if the window navigator
                //is available)
                if (!$rootScope.currentPosition) {
                    leafletData.getMap().then(function (map) {
                        map.on('locationfound',function (e) {
                            $rootScope.isGeoLocationInactive = false;
                            $rootScope.currentPosition = {
                                lat: e.latitude,
                                lng: e.longitude
                            };
                            loadMap();

                        }).on('locationerror', function () {
                            $rootScope.isGeoLocationInactive = true;
                            //By default, center the map in Barcelona
                            $scope.center = {
                                lat: 41.385052,
                                lng: 2.173233,
                                zoom: parseInt($attrs.zoom) || 16
                            };

                            loadMap();
                            alert("No es posible calcular su ubicación.");
                        });
                    });

                    //Emit click events on the markers and attach marker info to the event
                    $scope.$on('leafletDirectiveMarkersClick', function (e, marker_index) {
                        $scope.$emit('onMarkerClick', $scope.markers[marker_index]);
                    });
                }
            }]
        };
    }]);

