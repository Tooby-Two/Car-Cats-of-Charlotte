$(document).ready(function () {
    const folders = ['car_cats', 'jefferyverse', 'other']; // Folder names to search
    const galleryContainer = $('#mainGallery');
    const urlParams = new URLSearchParams(window.location.search);
    const characterName = urlParams.get('name');
    $('#lightboxOverlay').hide();

    const tagToCharacterMapping = {
        "Reddick": "car_cats",
        "Jeffery": "jefferyverse",
        "Heim": "car_cats",
        "Creed": "car_cats",
        "Bubba": "car_cats",
        "Raiden": "other",
        "Magma": "other",
        "Willow": "other",
        "Arthur": "other",
        "Moonie": "other",
        "Roy": "other",
        "Nolan": "other",
        "ET": "other",
        "Interstellar": "other",
        "SVK": "car_cats",
        "Lajoie": "car_cats",
        "Hunter": "other",
        "SolarFlare": "other",
        "Ignis": "other"
        // Add other characters and their corresponding folder paths
    };

    // Function to search for character in multiple folders
    const searchCharacterInFolders = (name) => {
        let characterFile = '';
        let found = false;

        // Iterate through folders to find the character file
        for (const folder of folders) {
            characterFile = `characters/${folder}/${name}.html`;
            $.ajax({
                url: characterFile,
                type: 'HEAD', // Send a HEAD request to check if the file exists
                async: false, // Make it synchronous so it doesn't continue until the file is found
                success: function () {
                    found = true;
                },
                error: function () {
                    // Do nothing on error; just continue to check other folders
                }
            });

            if (found) break; // Exit the loop once the file is found
        }

        return found ? characterFile : null; // Return the file path if found, otherwise null
    };

    const characterFile = searchCharacterInFolders(characterName); // Search through folders for the character file

    if (characterFile) {
        // If the character file is found, load the content
        $.get(characterFile, function (response) {
            const characterData = $(response).filter('#character-data').html();
            const data = JSON.parse(characterData);

            if (data) {
                $('.character-name').text(data.name);
                $('#character-designer').html(data.designer);
                $('#main-character-image').attr('src', data.gallery?.[0]?.full);
                $('#character-details').html(data.details);
                $('#character-appearance').html(data.appearance);
                $('#character-personality').html(data.personality);
                $('#character-backstory').html(data.backstory);
                $('#uniqueContent').html(data.uniqueContent);

                document.documentElement.style.setProperty('--primary-color', data.color);
                document.documentElement.style.setProperty('--secondary-color', data.colorSecondary);

                $('.sidebar').css('background-image', `url(${data.sidebarImage})`);

                // Populate the gallery
                if (data.gallery && data.gallery.length > 0) {
                    const galleryContainer = $('#indivCharacterGallery');
                    data.gallery.forEach((img) => {
                        const tagsHTML = img.tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join(' ');

                        const galleryItem = `
                            <div class="col-5 col-sm-4 col-md-3 mb-4 gallery-item" data-tags="${img.tags.join(',')}">
                                <div class="gallery-item-inner">
                                    <img src="${img.thumb}" 
                                         class="img-thumbnail bg-dark gallery-thumb" 
                                         alt="${img.tags.join(',')}"
                                         data-full="${img.full}" 
                                         data-credit="${img.credit}">
                                    <div class="gallery-caption">
                                        ${img.caption}
                                        <div class="gallery-tags mt-2">${tagsHTML}</div>
                                    </div>
                                </div>
                            </div>`;
                        galleryContainer.append(galleryItem);
                    });
                }
            } else {
                $('.character-name').text('Character not found');
                $('#character-details').html('<p>No details available for this character.</p>');
            }
        }).fail(function () {
            $('.character-name').text('Character not found');
            $('#character-details').html('<p>No details available for this character.</p>');
        });
    } else {
        // If no character file is found, show an error
        $('.character-name').text('Character not found');
        $('#character-details').html('<p>No details available for this character.</p>');
    }

    // Lightbox functionality
    $(document).on('click', '.gallery-thumb', function () {
        const fullImageSrc = $(this).data('full');
        const credit = $(this).data('credit');
        const tags = $(this).attr('alt').split(",");  // Assuming alt contains tags like "Reddick,Jeffery"

        // Update lightbox content
        $('#lightboxImage').attr('src', fullImageSrc);
        $('#lightboxCredit').html(credit).show();

        // Create buttons for each character based on the tags
        let characterLinks = '';
        tags.forEach(tag => {
            if (tagToCharacterMapping[tag]) { // Check if the tag is mapped to a character
                const folder = tagToCharacterMapping[tag]; // Get the folder from the mapping
                const iconPath = `images/icons/${tag.toLowerCase()}_icon.png`; // Modify this path to your icon image location
                characterLinks += `
                    <a href="_character-template.html?name=${tag}" class="btn btn-primary mt-3">
                        <img src="${iconPath}" alt="${tag} Icon" class="character-icon me-2">
                        View ${tag}
                    </a>`;
            }
        });

        // Append buttons to lightbox content
        $('#lightboxContent').append(characterLinks);

        $('#lightboxOverlay').fadeIn();
    });

    // Close lightbox when clicking outside of the content area
    $('#lightboxOverlay').on('click', function () {
        $('#lightboxOverlay').fadeOut();
        $('#lightboxContent').find('a').remove(); // Remove the appended character link when closing the lightbox
    });

    $('#lightboxClose').on('click', function () {
        $('#lightboxOverlay').fadeOut();
        $('#lightboxContent').find('a').remove(); // Remove the appended character link when closing the lightbox
    });

    // Implementing the search functionality
    $('#searchBar').on('input', function () {
        const searchQuery = $(this).val().toLowerCase();

        $('.gallery-item').each(function () {
            const tags = $(this).data('tags').toLowerCase();
            if (tags.includes(searchQuery)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});
