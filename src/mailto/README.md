Mailto is a directive to send emails via the "mailto://" ptrotocol.

It has 3 parameters:
- data-mailto: Predefined receiver email address.
- data-mailto-subject: Predefined subject of the email.
- data-mailto-content: Predefined content of the email


Installation

As standalone just include the file in a script tag:

<script src="mailto.js"></script>


Usage

<button
    data-mailto="hello@makelean.com"
    data-mailto-subject="This is a subject!"
    data-mailto-content="Hey, great content here!">Send email</button>


Plunk

http://plnkr.co/edit/aVPxy3gTGMTTDh9qLVOh