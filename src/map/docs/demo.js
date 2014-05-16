function MapDemoCtrl($scope, $httpBackend) {
    'use strict';

    /**
     * Query that will be appended to the url when searching for markers
     * @type {{}}
     */
    $scope.query = {};

    /**
     * Define a center if you want to center the map in a point
     *
     * @type {{lat: number, lng: number, zoom: number}}
     */
    $scope.myCenter = {
        lat: 41.38170,
        lng: 2.15910,
        zoom: 16
    };

    /**
     * Implement your own popup html that will appear when the marker is clicked
     * @param marker
     * @returns {string}
     */
    $scope.onPopup = function (marker) {
        return '<a href="/#/offers/' + marker.id + '">' + marker.title + '</a>';
    };

    /**
     * Response from the server using a pager
     *
     * @type {{nbPages: number, nbResults: number, results: *[]}}
     */
    var response = {
        nbPages: 1,
        nbResults: 2,
        results: [
            {
                location: {
                    id: 1,
                    title: 'Car on Sale',
                    lat: 41.38202,
                    lng: 2.15876,
                    icon: {
                        iconUrl: 'http://www.lorempixel.com/25/25',
                        iconSize: [25, 25],
                        shadowSize: [5, 5],
                        shadowAnchor: [5, 5]
                    }
                }

            },
            {
                location: {
                    id: 2,
                    title: 'Washing machine on sale',
                    lat: 41.38230,
                    lng: 2.15899,
                    icon: {
                        iconUrl: 'http://www.lorempixel.com/25/25',
                        iconSize: [25, 25],
                        shadowSize: [5, 5],
                        shadowAnchor: [5, 5]
                    }
                }
            }
        ]
    };
    $httpBackend.whenGET(/^\/api\/offers\?.*page=\d/).respond(response);
}

MapDemoCtrl.$inject = [ '$scope', '$httpBackend'];