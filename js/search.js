$(document).ready(function () {
    const characters = ['reddick', 'bubba', 'Creed']; // Add all character names here
    const characterList = $('#characterList');

    // Load all character data
    const loadCharacters = () => {
        characterList.empty();

        characters.forEach((character) => {
            const characterFile = `characters/${character}.html`;

            $.get(characterFile, function (response) {
                const characterData = $(response).filter('#character-data').html();
                const data = JSON.parse(characterData);

                if (data) {
                    // Get the thumbnail of the first gallery image, or fallback to a placeholder
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
            });
        });
    };

    // Filter characters based on search query
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

    // Load characters initially
    loadCharacters();
});
