# Atomic ui

Atomic UI contains the markup and javascript for all Testabit's components.

## Installation

Download the project and run ``bower install``  to get all the required libraries
Then use grunt to build the project doing ``grunt build`` .
Open dist/index.html to see the documentation and examples

## Development
If you want to work on the project and make changes and have the documentation page automatically updated you can use
the ``grunt watch`` task. This task listens to the files and generates new assets under the dist directory.

## Release
When you want to make a new release, commit the dist files and push them to the server
Then, create a new tag ( e.g. ``git tag 0.0.2`` ) and push it to the server using ``git push origin --tags`
