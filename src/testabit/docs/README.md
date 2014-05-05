**Dependencies**

- angularitics.js

    ```
        <script src="/components/angularitics/src/angulartics.js"></script>
    ```

You can add the testabit behaviour to any button by adding the following attributes:

**API**

  - testabit="modal" (possible values : "silent", "modal")
  - testabit-category="TestCategory"  Required. Analytics Category : see how to define your allowed categories in the configuration
  - testabit-action="test.button"  Required: Analytics Action : the action name you want to give it
  - testabit-label="Test Label"  Required: Analytics Label : the label you want to give it
  - testabit-value=""