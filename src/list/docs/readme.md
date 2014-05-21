List creates a paginated list that fetches the data from the server in a paginated order

**API**
  - api-url : (string) url where the list is going to obtain the data from ( e.g. "/api/users" )
  - api-query : (object) query to be added to the api url in order to filter for the results ( e.g '{}')
  - list-class : (string) class for the UL element
  - list-cache (boolean) pager should use cache or not
  - load-on-search-event: (attr) by default, directive launch pager when directive is instantiated (with an api-url and api-query given). If attr is set, pager load only will be performed if searchEvent.SEARCH_CHANGE event is dispatched from $rootScope.

