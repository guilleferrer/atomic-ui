angular.module('ui.atomic.testabit')
    .config(function (testabitProvider) {
        // Configure the array of your "allowed categories"
        testabitProvider.setCategories([ 'TestCategory']);
        /*   When enabling debug mode ( default ) testabit draws the borders of
         the html element where you are applying the directive
         If the border is red, the directive is missing some parameter
         You can see the error in the console of your browser.
         Set debugMode to false in the prod environment */
        testabitProvider.debugMode = true;
    });