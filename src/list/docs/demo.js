function ListDemoCtrl($httpBackend) {
    var firstPage = {
        nbPages: 2,
        nbResults: 2,
        results: [
            {
                title: "First Item",
                description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, consectetur eius exercitationem inventore ipsam itaque labore magnam nihil non placeat praesentium quidem quod reprehenderit soluta sunt suscipit vero voluptates voluptatibus?",
                imageUrl: "http://www.lorempixel.com/50/50"
            },
            {
                title: "Second Item",
                description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, consectetur eius exercitationem inventore ipsam itaque labore magnam nihil non placeat praesentium quidem quod reprehenderit soluta sunt suscipit vero voluptates voluptatibus?",
                imageUrl: "http://www.lorempixel.com/50/50"
            }
        ]};
    var secondPage = {
        nbPages: 2,
        nbResults: 2,
        results: [
            {
                title: "Third Item",
                description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, consectetur eius exercitationem inventore ipsam itaque labore magnam nihil non placeat praesentium quidem quod reprehenderit soluta sunt suscipit vero voluptates voluptatibus?",
                imageUrl: "http://www.lorempixel.com/50/50"
            },
            {
                title: "Fourth Item",
                description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, consectetur eius exercitationem inventore ipsam itaque labore magnam nihil non placeat praesentium quidem quod reprehenderit soluta sunt suscipit vero voluptates voluptatibus?",
                imageUrl: "http://www.lorempixel.com/50/50"
            }
        ]};

    $httpBackend.whenGET(/^\/api\/entities\?page=1/).respond(firstPage)
    $httpBackend.whenGET(/^\/api\/entities\?page=2/).respond(secondPage)
}