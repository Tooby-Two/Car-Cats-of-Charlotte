$(document).ready(function () {
    const characterList = $('#characterList'); // Where character cards will be added

    const urlParams = new URLSearchParams(window.location.search);
    var worldName = urlParams.get('world');

    const validFolders = ['car_cats', 'jefferyverse', 'other', 'ecliptica', 'cbcs'];
    const worldNamesPretty = {
        car_cats: 'Car Cats',
        jefferyverse: 'Jefferyverse',
        other: 'Other',
        ecliptica: 'Ecliptica',
        cbcs: 'CBCS'
    };

    function generateWorldButtons(currentWorld) {
        const filterContainer = $('#worldFilters');
    
        // Add the "All" button
        const allButton = $(`
            <a href="search.html" class="btn btn-sm mx-1 ${!currentWorld ? 'btn-primary' : 'btn-outline-primary'}" id="allButton">
                All
            </a>
        `);
        filterContainer.append(allButton);
    
        // Add buttons for each world
        validFolders.forEach(world => {
            const button = $(`
                <a href="?world=${world}" class="btn btn-sm mx-1 ${world === currentWorld ? 'btn-primary' : 'btn-outline-primary'}">
                    ${worldNamesPretty[world] || world}
                </a>
            `);
            filterContainer.append(button);
        });
    }

    generateWorldButtons(worldName);

    // Load all character data dynamically using the JSON mapping
    // Load all character data dynamically using the JSON mapping
const loadCharacters = () => {
    characterList.empty(); // Clear the list

    $.getJSON('data/tagToCharacterMapping.json', function (mapping) {
        // Filter characters by worldName if specified
        if (worldName && validFolders.includes(worldName)) {
            const filteredMapping = {};
            Object.entries(mapping).forEach(([character, folder]) => {
                if (folder === worldName) {
                    filteredMapping[character] = folder;
                }
            });
            mapping = filteredMapping; // Update mapping to only include filtered characters
        }

        // Load characters from the filtered mapping
        Object.entries(mapping).forEach(([character, folder]) => {
            const characterFile = `characters/${folder}/${character}.html`;

            $.get(characterFile, function (response) {
                const characterData = $(response).filter('#character-data').html();

                try {
                    const data = JSON.parse(characterData);

                    if (data) {
                        const thumbnail = data.gallery?.[0]?.thumb || 'images/placeholder.png';

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
                        characterList.append(characterCard);
                    }
                } catch (err) {
                    console.error(`❌ Error parsing character data for ${character}:`, err);
                }
            }).fail(function () {
                console.warn(`⚠️ Failed to load character file: ${characterFile}`);
            });
        });
    }).fail(function () {
        console.error('❌ Failed to load tagToCharacterMapping.json');
    });
};

    // Filter characters on search
    $('#characterSearchBar').on('input', function () {
        const searchQuery = $(this).val().toLowerCase();

        $('.character-item').each(function () {
            const name = $(this).data('name');
            const traits = $(this).data('traits');

            if (name.includes(searchQuery) || traits.includes(searchQuery)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    loadCharacters(); // Load on page load
});
