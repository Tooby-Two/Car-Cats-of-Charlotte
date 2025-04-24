$(document).ready(function () {
    const folders = ['car_cats', 'jefferyverse', 'other', 'ecliptica', 'cbcs']; // Folder names
    const galleryContainer = $('#mainGallery');
    const loadingIndicator = $('<div id="loadingIndicator" class="text-center my-5"><div class="spinner-border text-primary" role="status"></div><p>Loading gallery...</p></div>');

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
            <a href="gallery.html" class="btn btn-sm mx-1 ${!currentWorld ? 'btn-primary' : 'btn-outline-primary'}" id="allButton">
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


    // Add loading indicator
    galleryContainer.append(loadingIndicator);

    let tagToCharacterMapping = {};
    let allImages = [];
    const uniqueImages = new Set(); // Use a Set to track unique image URLs
    let characterLoadStatus = {
        total: 0,
        loaded: 0,
        successful: 0,
        failed: 0
    };

    $('#lightboxOverlay').hide();

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Function to update the loading status
    function updateLoadingStatus() {
        const percent = Math.round((characterLoadStatus.loaded / characterLoadStatus.total) * 100);
        $('#loadingIndicator').html(`
            <div class="progress mb-3" style="height: 20px;">
                <div class="progress-bar" role="progressbar" style="width: ${percent}%;" 
                     aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${percent}%</div>
            </div>
            <p>Loaded ${characterLoadStatus.loaded} of ${characterLoadStatus.total} characters</p>
            <p class="text-success">Successful: ${characterLoadStatus.successful}</p>
            <p class="text-danger">Failed: ${characterLoadStatus.failed}</p>
        `);
    }

    // Function to check if a file exists
    function checkFileExists(url) {
        return new Promise((resolve) => {
            $.ajax({
                url: url,
                type: 'HEAD',
                success: function () {
                    resolve(true);
                },
                error: function () {
                    resolve(false);
                }
            });
        });
    }

    // Function to load images from each character's HTML file in the specified folder
    function loadCharacterImagesFromFolder(folder, onComplete, characterNames) {
        const loadPromises = characterNames.map(character => {
            const characterFile = `characters/${folder}/${character}.html`;

            return checkFileExists(characterFile).then(exists => {
                if (!exists) {
                    console.warn(`File not found: ${characterFile}`);
                    return null; // Skip this character
                }

                return $.get(characterFile).then(response => {
                    const characterData = $(response).filter('#character-data').html();
                    if (!characterData) {
                        console.warn(`Character data not found in ${characterFile}`);
                        return null; // Skip this character
                    }

                    const data = JSON.parse(characterData);
                    if (data && data.gallery && data.gallery.length > 0) {
                        return data.gallery.map(img => {
                            if (!img.folder) img.folder = folder;
                            return img;
                        });
                    }

                    return null; // No gallery for this character
                }).catch(err => {
                    console.error(`Error loading ${characterFile}:`, err);
                    return null; // Skip this character
                });
            });
        });

        Promise.all(loadPromises).then(results => {
            results.forEach(images => {
                if (images) {
                    images.forEach(img => {
                        if (!uniqueImages.has(img.full)) {
                            uniqueImages.add(img.full);
                            allImages.push(img);
                        }
                    });
                }
            });

            onComplete(); // Call the completion callback
        });
    }

    // Shuffle and display images
    function displayImages() {
        shuffleArray(allImages); // Shuffle the images array

        // Remove loading indicator
        $('#loadingIndicator').remove();


        if (allImages.length === 0) {
            galleryContainer.append('<div class="alert alert-warning">No images found. Please check your character files.</div>');
            return;
        }

        allImages.forEach((img) => {
            const tagsHTML = img.tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join(' ');

            const galleryItem = `
                <div class="col-5 col-sm-4 col-md-3 mb-4 gallery-item" data-tags="${img.tags.join(',')}">
                    <div class="gallery-item-inner">
                        <img src="${img.thumb}" 
                             class="img-thumbnail bg-dark gallery-thumb" 
                             alt="${img.tags}"
                             data-full="${img.full}" 
                             data-credit="${img.credit || ''}"
                             data-folder="${img.folder || ''}">
                        <div class="gallery-caption">
                            ${img.caption || ''}
                            <div class="gallery-tags mt-2">${tagsHTML}</div>
                        </div>
                    </div>
                </div>`;
            galleryContainer.append(galleryItem);
        });
    }
    

    // Main execution starts here
    $.getJSON('data/tagToCharacterMapping.json')
        .done(function (data) {
            tagToCharacterMapping = data;
            charactersByFolder = {};


            // Sort characters into folders
            for (const [character, folder] of Object.entries(tagToCharacterMapping)) {
                if (!folders.includes(folder)) continue; // Skip invalid folder
                if (!charactersByFolder[folder]) charactersByFolder[folder] = [];
                charactersByFolder[folder].push(character);
            }

            // If worldName is specified, filter to only that folder
            if (worldName && folders.includes(worldName)) {
                const filteredCharacters = {};
                filteredCharacters[worldName] = charactersByFolder[worldName] || [];
                charactersByFolder = filteredCharacters;
            }

            // Count total characters
            characterLoadStatus.total = Object.values(charactersByFolder).reduce((sum, list) => sum + list.length, 0);
            updateLoadingStatus();

            // Process each folder one by one
            const processFolders = (folderIndex) => {
                if (folderIndex >= folders.length) {
                    // All folders processed, display images
                    displayImages();
                    return;
                }

                const folder = folders[folderIndex];
                const characterList = charactersByFolder[folder] || [];

                if (characterList.length === 0) {
                    // Skip empty folders
                    processFolders(folderIndex + 1);
                    return;
                }

                // Process this folder's characters
                loadCharacterImagesFromFolder(folder, function () {
                    // When this folder is done, process the next one
                    processFolders(folderIndex + 1);
                }, characterList);
            };

            // Start processing folders
            processFolders(0);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Failed to load tagToCharacterMapping.json:", textStatus, errorThrown);
            galleryContainer.html('<div class="alert alert-danger">Failed to load character mapping data. Please check your configuration.</div>');
        });

    // Lightbox functionality
    $(document).on('click', '.gallery-thumb', function () {
        const fullImageSrc = $(this).data('full') || $(this).attr('src').replace('_thumb', '');
        const credit = $(this).data('credit') || '';
        const tags = $(this).attr('alt').split(',');

        // Update lightbox content
        $('#lightboxImage').attr('src', fullImageSrc);
        $('#lightboxCredit').html(credit).toggle(credit !== '');

        // Clear previous character links
        $('#lightboxContent').find('.character-links').remove();

        // Create a container for character links
        const characterLinksContainer = $('<div class="character-links mt-3"></div>');

        // Create buttons for each character based on the tags
        tags.forEach(tag => {
            const trimmedTag = tag.trim();
            if (tagToCharacterMapping[trimmedTag]) {
                const folder = tagToCharacterMapping[trimmedTag];
                const iconPath = `images/icons/${trimmedTag.toLowerCase()}_icon.png`;

                const characterLink = $(`
                    <a href="_character-template.html?name=${trimmedTag}" class="btn btn-primary me-2 mb-2">
                        <img src="${iconPath}" alt="${trimmedTag} Icon" class="character-icon me-2" onerror="this.style.display='none'">
                        View ${trimmedTag}
                    </a>`);

                characterLinksContainer.append(characterLink);
            }
        });

        // Append buttons to lightbox content
        $('#lightboxContent').append(characterLinksContainer);
        $('#lightboxOverlay').fadeIn();
    });

    // Close lightbox when clicking outside of the content area
    $('#lightboxOverlay').on('click', function (e) {
        if ($(e.target).is('#lightboxOverlay')) {
            $('#lightboxOverlay').fadeOut();
        }
    });

    $('#lightboxClose').on('click', function () {
        $('#lightboxOverlay').fadeOut();
    });

    // Implementing the search functionality
    $('#searchBar').on('input', function () {
        const searchQuery = $(this).val().toLowerCase();

        if (searchQuery.length === 0) {
            $('.gallery-item').show();
            return;
        }

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