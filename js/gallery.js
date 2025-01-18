$(document).ready(function () {
    const folders = ['car_cats', 'jefferyverse', 'other']; // Folder names
    const galleryContainer = $('#mainGallery');

    $('#lightboxOverlay').hide();

    let allImages = [];
    const uniqueImages = new Set(); // Use a Set to track unique image URLs

    // Function to load images from each character's HTML file in the specified folder
    function loadCharacterImagesFromFolder(folder) {
        // List of character names in the folder
        const characterNames = ['Creed', 'Jeffery', 'reddick', 'bubba', 'Raiden', 'Magma', 'Willow','Arthur'];

        characterNames.forEach((character) => {
            const characterFile = `characters/${folder}/${character}.html`; // Path to the character's HTML file

            $.get(characterFile, function (response) {
                // Parse the character data embedded within the HTML
                const characterData = $(response).filter('#character-data').html();
                const data = JSON.parse(characterData);

                // If the character has gallery images, process them
                if (data && data.gallery && data.gallery.length > 0) {
                    data.gallery.forEach((img) => {
                        // Check if the image is already in the unique set
                        if (!uniqueImages.has(img.full)) {
                            uniqueImages.add(img.full); // Add the image's full URL to the set
                            allImages.push(img); // Store the image

                            const tagsHTML = img.tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join(' ');

                            const galleryItem = `
                                <div class="col-5 col-sm-4 col-md-3 mb-4 gallery-item" data-tags="${img.tags.join(',')}">
                                    <div class="gallery-item-inner">
                                        <img src="${img.thumb}" 
                                             class="img-thumbnail bg-dark gallery-thumb" 
                                             alt="${data.name}"
                                             data-full="${img.full}" 
                                             data-credit="${img.credit}">
                                        <div class="gallery-caption">
                                            ${img.caption}
                                            <div class="gallery-tags mt-2">${tagsHTML}</div>
                                        </div>
                                    </div>
                                </div>`;
                            galleryContainer.append(galleryItem);
                        }
                    });
                }
            }).fail(function () {
                console.error(`Failed to load ${characterFile}`);
            });
        });
    }

    // Loop through each folder to load images
    folders.forEach((folder) => {
        loadCharacterImagesFromFolder(folder); // Load images from each folder
    });

    // Lightbox functionality
    $(document).on('click', '.gallery-thumb', function () {
        const fullImageSrc = $(this).attr('src').replace('_thumb', '');
        const credit = $(this).data('credit');
        $('#lightboxImage').attr('src', fullImageSrc);
        $('#lightboxCredit').html(credit).show();
        $('#lightboxOverlay').fadeIn();
    });

    $('#lightboxClose, #lightboxOverlay').on('click', function () {
        $('#lightboxOverlay').fadeOut();
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
