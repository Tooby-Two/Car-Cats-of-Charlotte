$(document).ready(function () {
    const folders = ['car_cats', 'jefferyverse', 'other']; // Folder names
    const galleryContainer = $('#mainGallery');
    const tagToCharacterMapping = {
        "Reddick": "car_cats",
        "Heim": "car_cats",
        "Jeffery": "jefferyverse",
        "Creed": "car_cats",
        "Bubba": "car_cats",
        "Raiden": "other",
        "Magma": "other",
        "Willow": "other",
        "Arthur": "other",
        "Moonie": "other"
        // Add other characters and their corresponding folder paths
    };

    $('#lightboxOverlay').hide();

    let allImages = [];
    const uniqueImages = new Set(); // Use a Set to track unique image URLs

    // Function to load images from each character's HTML file in the specified folder
    function loadCharacterImagesFromFolder(folder) {
        // List of character names in the folder
        const characterNames = ['Moonie','Heim','Creed', 'Jeffery', 'Bubba', 'Raiden', 'Magma', 'Willow', 'Arthur'];

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
                                             alt="${img.tags}"
                                             data-full="${img.full}" 
                                             data-credit="${img.credit}"
                                             data-folder="${img.folder}">
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
