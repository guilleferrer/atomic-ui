Usage
-----

Requires these javascripts :
        * testabit.js
        * angulartics.js

You can add the testabit behaviour to any button by adding the following attributes:

        <button data-testabit="modal" <!-- possible values : "silent", "modal" -->
                data-testabit-category="TestCategory" <!-- (*) Analytics Category : see how to define your allowed categories in the configuration -->
                data-testabit-action="test.button" <!-- (*) Analytics Action : the action name you want to give it -->
                data-testabit-label="Test Label" <!-- (*) Analytics Label : the label you want to give it -->
                data-testabit-value=""><!-- Analytics value -->
            Testabit Button
        </button>

        (*) : required




Configuration
-------------


    angular.module('ui.atomic.testabit')
            .config(function (testabitProvider) {
                testabitProvider.setCategories([ 'TestCategory']); // Configure the array of your "allowed categories"

                testabitProvider.debugMode = true; /*   When enabling debug mode ( default ) testabit draws the borders of
                                                        the html element where you are applying the directive
                                                        If the border is red, the directive is missing some parameter
                                                        You can see the error in the console of your browser.

                                                        Set debugMode to false in the prod environment
                                                   */
            })




