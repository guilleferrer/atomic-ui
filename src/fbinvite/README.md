Fbinvite is a directive to open Facebook window and allow you to invite your Facebook friends to use the application.


Installation

Include the js file in a script tag:

<script src="fbinvite.js"></script>


Usage

Initialize the facebook script in any page that has to access facebook routines:

{% set initializeFacebook=true %}

and use the fb-invite directive as a parameter of a DOM element:

<button data-fbinvite
        data-fbinvite-title="My title!"
        data-fbinvite-message="My message!">Invite your friends!</button>


The title parameter is optional, if not set the default value is "Select Friends for [APPLICATION NAME] Requests"
The message parameter is required. If not set an exception is throwed.

Gotchas

Make sure you initialize facebook before loading your directive (i.e. don't try to initialize inside an "include" statement)

TODO
