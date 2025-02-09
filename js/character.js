$(document).ready(function () {
    const folders = ['car_cats', 'jefferyverse', 'other', 'ecliptica']; // Folder names to search
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
        "Drennix": "car_cats",
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
        "Ignis": "other",
        "Vaporwavezz": "other",
        "Cherry": "other",
        "Gruff": "other",
        "Nova": "ecliptica",
        "Volt": "ecliptica",
        "Dragon": "other",
        "Icicle": "other",
        "Allmendinger": "car_cats",
        "Rheem": "car_cats",
        "Patchwork": "other"
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

                document.title = `Tooby_Two - ${data.name} - Character Details`;
                $('.character-name').text(data.name);
                $('#character-designer').html(data.designer);
                $('#main-character-image').attr('src', data.gallery?.[0]?.full);
                $('#character-age').html(data.age);
                $('#character-pronouns').html(data.pronouns);
                $('#character-species').html(data.species);
                $('#character-role').html(data.role);
                $('#character-fur-color').html(data.furColor);
                $('#character-eye-color').html(data.eyeColor);
                $('#character-likes').html(data.likes);
                $('#character-dislikes').html(data.dislikes);

                $('#character-appearance').html(data.appearance);
                $('#character-personality').html(data.personality);


                $('#character-backstory').html(data.backstory);
                $('#uniqueContent').html(data.uniqueContent);
                $('#character-icon').attr('src', data.icon);
                $('#character-reference').attr('src', data.gallery?.[1]?.thumb);
                $('#character-reference').attr('data-full', data.gallery?.[1]?.full);
                $('#character-reference').attr('data-credit', data.gallery?.[1]?.credit);



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

                // Populate character links if they exist
                if (data.links && data.links.length > 0) {
                    const linksContainer = $('#character-links'); // Make sure you have a div with this ID in your HTML
                    linksContainer.empty(); // Clear previous content

                    data.links.forEach(link => {
                        const linkHTML = `
                            <div class="character-link-container d-flex align-items-center justify-content-center">
                            <!-- Main Character -->
                                <div class="character-main text-center">
                                    <img src="${data.gallery?.[0]?.thumb}" alt="${data.name}" class="character-img">
                                    <div class="speech-bubble left">
                                        <p>"${link.thought || "..."}"</p>
                                    </div>
                                </div>

                                <!-- Linked Character -->
                                <div class="character-linked text-center">
                                    <a href="_character-template.html?name=${link.name}">
                                    <img src="${link.image}" alt="${link.name}" class="character-img">
                                    </a>
                                    <div class="speech-bubble right">
                                        <p>"${link.quote}"</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Relationship Summary -->
                            <div class="relationship-summary text-center">
                                <p>${link.summary}</p>
                            </div>
                            `;
                        linksContainer.append(linkHTML);
                    });
                } else {
                    $('#character-links').html('<p>No links available.</p>');
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
                    <a href="_character-template.html?name=${tag}" class="character-link btn btn-primary mt-3">
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
