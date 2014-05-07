Multiple Choice opens a modal containing a list of options that can be checked/unchecked and stores the
selected options when it is closed. If the modal is dismissed, the previous selection is restored and new changes in
the selection are ignored

**API**
 - choices: {array} Array of objects with all possible choices. If the choices has "selected: true" then the choice will
            be marked as checked;
 - ngModel: '=',

 - modalFooter: {string} Text in the footer of the modal. Defaults to OK.
 - modalHeader: {string} Text in the header of the modal.
