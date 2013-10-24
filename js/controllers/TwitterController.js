searchApp.controller('Twitter', function ($scope, ejsResource) {
    var ejs = ejsResource('http://localhost:9200');
    var index = 'twitter';

    var highlightPost = ejs.Highlight(["text"])
        .fragmentSize(150, "text")
        .numberOfFragments(1, "text")
        .preTags("<b>", "text")
        .postTags("</b>", "text");

    var hashtagFacet = ejs.TermsFacet('Hashtag')
        .field('hashtag.text')
        .size(10);

    var statusRequest = ejs.Request()
        .indices(index)
        .types('status')
        .highlight(highlightPost)
        .facet(hashtagFacet);

    var activeFilters = {};

    $scope.resultsArr = [];

    $scope.search = function() {
        activeFilters = {};
        $scope.resultsArr = [];
        if (!$scope.queryTerm == '') {
            results = statusRequest
                .query(applyFilters(ejs.MatchQuery('_all', $scope.queryTerm)))
                .fields(['text', 'user', 'created_at'])
                .doSearch();

            $scope.resultsArr.push(results);
        } else {
            results = {};
            $scope.resultsArr = [];
            activeFilters = {};
        }
    };


    $scope.renderResult = function(result){
        // console.log(result);
        var resultText = "";
        if (result.highlight)
            resultText = result.highlight.text[0];
        else if (result.fields.text)
            resultText = result.fields.text;
        else
            resultText = result._id;
        
        return resultText;
    };
    
    $scope.renderResultMetadata = function (result) {
        var metadata = "Twetted by <a href=\"https://twitter.com/" + result.fields.user.screen_name + "\">" + result.fields.user.name + "</a>, on " + result.fields.created_at.split("T")[0];
        return metadata;
    };

    /*
     * facets
     */
    $scope.isActive = function (field, term) {
        return activeFilters.hasOwnProperty(field + term);
    };

    searchFacet = function() {
        $scope.resultsArr = [];
        results = statusRequest
            .query(applyFilters(ejs.MatchQuery('_all', $scope.queryTerm)))
            .fields(['text', 'user', 'created_at'])
            .doSearch();

        $scope.resultsArr.push(results);
    };

    $scope.filter = function (field, term) {
        if ($scope.isActive(field, term)) {
            delete activeFilters[field + term];
        } else {
            activeFilters[field + term] = ejs.TermFilter(field, term);
        }
        searchFacet();
    };

    var applyFilters = function(query) {

        var filter = null;
        var filters = Object.keys(activeFilters).map(function(k) { return activeFilters[k]; });
        // console.log(activeFilters)
        // if more than one filter, use AND operator
        if (filters.length > 1) {
            filter = ejs.AndFilter(filters);
        } else if (filters.length === 1) {
            filter = filters[0];
        }

        return filter ? ejs.FilteredQuery(query, filter) : query;
    };

    $scope.isFiltered = function () {
      if (!jQuery.isEmptyObject(activeFilters))
        return "<b>Reset search</b>";
    };

    $scope.resetFilter = function() {
        activeFilters = {};
        $scope.search();
    };

    $scope.renderFacetItem = function(term, count){
        // if the filter is activated, add [x] sign
        if ($scope.isActive('hashtag.text', term)) {
            return "<b> [x] " + term + "</b> " + count;
        }
        else
            return "<b>" + term + "</b> " + count;
    };

    /*
     * simple way for handling pagination
     * $per_page: number of returned results per page
     * $page: page counter
     */
    $scope.per_page = 10;
    $scope.page = 0;

    $scope.show_more = function () {
        $scope.page += 1;
        $scope.searchMore($scope.page*$scope.per_page);
    };

    $scope.searchMore = function(offset) {
        if (!$scope.queryTerm == '') {
            $scope.results = statusRequest
                .query(applyFilters(ejs.MatchQuery('_all', $scope.queryTerm)))
                .from(offset)
                .fields(['text', 'user', 'created_at'])
                .doSearch();

            $scope.resultsArr.push($scope.results);
        }
    };
});