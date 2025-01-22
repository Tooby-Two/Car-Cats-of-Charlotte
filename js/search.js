$(document).ready(function () {
    const characterFolders = ['characters/car_cats', 'characters/jefferyverse', 'characters/other']; // List of folders where characters are stored
    const characters = ['Ignis','SolarFlare', 'Hunter','Lajoie','SVK','ET', 'Interstellar', 'Nolan','Roy','Moonie', 'Heim','Reddick', 'Bubba', 'Creed', 'Jeffery', 'Raiden', 'Magma', 'Willow', 'Arthur']; // List of character names
    const characterList = $('#characterList'); // Element where character cards will be displayed

    // Load all character data
    const loadCharacters = () => {
        characterList.empty(); // Clear the character list before loading new data

        characterFolders.forEach((folder) => {
            // For each folder, loop through the list of characters and attempt to load their HTML files
            characters.forEach((character) => {
                const characterFile = `${folder}/${character}.html`; // Path to each character's HTML file
                console.log('Checking character file:', characterFile); // Log the character file being checked

                $.get(characterFile, function (response) {
                    console.log('Response from character file:', response); // Log the HTML response from the file

                    const characterData = $(response).filter('#character-data').html(); // Extract the character data from the HTML
                    console.log('Extracted character data:', characterData); // Log the extracted data

                    const data = JSON.parse(characterData); // Parse the character data
                    console.log('Parsed character data:', data); // Log the parsed data to see the structure

                    if (data) {
                        // Get the thumbnail of the first gallery image or a placeholder if not available
                        const thumbnail = data.gallery?.[0]?.thumb || 'images/placeholder.png';
                        console.log('Thumbnail:', thumbnail); // Log the thumbnail being used

                        // Create the character card
                        const characterCard = `
                            <div class="col-6 col-sm-4 col-md-3 mb-3 character-item" data-name="${data.name.toLowerCase()}" data-traits="${data.traits.join(',').toLowerCase()}">
                                <div class="card">
                                    <img src="${thumbnail}" class="card-img-top" alt="${data.name}">
                                    <div class="card-body">
                                        <h5 class="card-title">${data.name}</h5>
                                        <p class="card-text">${data.description}</p>
                                        <a href="_character-template.html?name=${character}" class="btn btn-primary">View Details</a>
                                    </div>
                                </div>
                            </div>`;
                        characterList.append(characterCard); // Add the character card to the list
                    } else {
                        console.log('No data found for character:', character); // Log if no data is found for the character
                    }
                }).fail(function () {
                    console.log('Failed to load character file:', characterFile); // Log failure to load the character file
                });
            });
        });
    };

    // Filter characters based on the search query
    $('#characterSearchBar').on('input', function () {
        const searchQuery = $(this).val().toLowerCase(); // Get the search query in lowercase
        console.log('Search query:', searchQuery); // Log the search query

        $('.character-item').each(function () {
            const name = $(this).data('name');
            const traits = $(this).data('traits');

            // Show or hide the character card based on the search query
            if (name.includes(searchQuery) || traits.includes(searchQuery)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // Load characters initially when the page loads
    loadCharacters();
});
