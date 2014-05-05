The confirm-url directive shows a confirmation dialog before calling the url given

*API*

 - confirm-url : {string} The url that is used to call after confirmation
 - follow-url: {boolean} Should it act as a link and change page ( to the url given in the confirm-delete parameter )

*EVENTS*

 - "apiEvent.ACTION_SUCCESS" when follow-url is set to false ( does not change page )