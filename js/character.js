$(document).ready(function () {
    const folders = ['car_cats', 'jefferyverse', 'other', 'ecliptica', 'cbcs']; // Folder names to search
    const urlParams = new URLSearchParams(window.location.search);
    const characterName = urlParams.get('name');

    // Show loading indicator
    const loadingIndicator = $('<div id="loadingIndicator" class="text-center my-5"><div class="spinner-border text-primary" role="status"></div><p>Loading character data...</p></div>');
    $('#character-details').before(loadingIndicator);

    $('#lightboxOverlay').hide();
    let tagToCharacterMapping = {};

    // Function to load tag to character mapping asynchronously
    function loadTagMapping() {
        return $.getJSON('data/tagToCharacterMapping.json')
            .then(function (data) {
                tagToCharacterMapping = data;
                return data;
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Failed to load tagToCharacterMapping.json:", textStatus, errorThrown);
                return {};
            });
    }

    // Function to check if a file exists
    function checkFileExists(url) {
        return new Promise((resolve) => {
            $.ajax({
                url: url,
                type: 'HEAD',
                timeout: 2000, // Set a reasonable timeout
                success: function () {
                    resolve(true);
                },
                error: function () {
                    resolve(false);
                }
            });
        });
    }

    // Function to find character file in folders - uses promises for better async handling
    async function findCharacterFile(name) {
        if (!name) return null;

        // First, check if we know which folder this character belongs to from the mapping
        await loadTagMapping();
        const folder = tagToCharacterMapping[name];

        if (folder && folders.includes(folder)) {
            // If we know the folder, check that specific location first
            const specificPath = `characters/${folder}/${name}.html`;
            const exists = await checkFileExists(specificPath);
            if (exists) return specificPath;
        }

        // If not found in the specific folder or no folder info available, check all folders
        for (const folder of folders) {
            const path = `characters/${folder}/${name}.html`;
            const exists = await checkFileExists(path);
            if (exists) return path;
        }

        return null; // Not found in any folder
    }

    // Function to load character data
    function loadCharacterData(file) {
        return $.get(file)
            .then(function (response) {
                try {
                    const characterData = $(response).filter('#character-data').html();
                    if (!characterData) {
                        console.warn(`Character data section not found in ${file}`);
                        return null;
                    }
                    return JSON.parse(characterData);
                } catch (e) {
                    console.error(`Error parsing character data from ${file}:`, e);
                    return null;
                }
            })
            .fail(function () {
                console.error(`Failed to load character file: ${file}`);
                return null;
            });
    }

    // Function to display character data on the page
    function displayCharacterData(data) {
        if (!data) {
            displayCharacterNotFound();
            return;
        }

        document.title = `${data.name || 'Character'}`;
        $('.character-name').text(data.name || 'Unnamed Character');

        // Set basic info with fallbacks for missing data
        $('#character-designer').html(data.designer || 'Unknown');
        $('#main-character-image').attr('src', data.gallery?.[0]?.full || 'images/placeholder.png');
        $('#character-age').html(data.age || 'Unknown');
        $('#character-pronouns').html(data.pronouns || 'Not specified');
        $('#character-species').html(data.species || 'Unknown');
        $('#character-role').html(data.role || 'N/A');
        $('#character-fur-color').html(data.furColor || 'N/A');
        $('#character-eye-color').html(data.eyeColor || 'N/A');
        $('#character-likes').html(data.likes || 'N/A');
        $('#character-dislikes').html(data.dislikes || 'N/A');

        // Set descriptive content
        $('#character-appearance').html(data.appearance || 'No appearance description available.');
        $('#character-personality').html(data.personality || 'No personality description available.');
        $('#character-backstory').html(data.backstory || 'No backstory available.');
        $('#uniqueContent').html(data.uniqueContent || '');

        // Set images and references with error handling
        $('#character-icon').attr('src', data.icon || 'images/default_icon.png')
            .on('error', function () {
                $(this).attr('src', 'images/default_icon.png');
            });

        // Handle reference images
        const referenceContainer = $('#character-reference-container');
        referenceContainer.empty(); // Clear existing content

        if (data.referenceImages && data.referenceImages.length > 0) {
            data.referenceImages.forEach(ref => {
                const referenceImage = $(`
                <div class="reference-image">
                    <img src="${ref.thumb}" class="gallery-thumb gallery-item card-img-top mx-auto" 
                         data-full="${ref.full}" alt="${ref.caption}">
                    <p class="text-center">${ref.caption || ''}</p>
                    <p class="text-center text-muted">${ref.credit || ''}</p>
                </div>
            `);
                referenceContainer.append(referenceImage);
            });
        } else {
            referenceContainer.html('<p>No reference images available.</p>');
        }


        // Set theme colors
        document.documentElement.style.setProperty('--primary-color', data.color || '#007bff');
        document.documentElement.style.setProperty('--secondary-color', data.colorSecondary || 'white');

        // Set sidebar image if available
        if (data.sidebarImage) {
            $('.sidebar').css('background-image', `url(${data.sidebarImage})`);
        }

        // Populate gallery
        populateGallery(data.gallery);
    }

    // Function to display an error when character is not found
    function displayCharacterNotFound() {
        $('.character-name').text('Character Not Found');
        $('#character-details').html(`
            <div class="alert alert-warning">
                <h4>Character "${characterName}" was not found</h4>
                <p>We couldn't find details for this character. Please check the name and try again.</p>
                <a href="gallery.html" class="btn btn-primary">View Gallery</a>
            </div>
        `);
    }

    // Function to populate the gallery
    function populateGallery(gallery) {
        const galleryContainer = $('#indivCharacterGallery');
        galleryContainer.empty();

        if (!gallery || gallery.length === 0) {
            galleryContainer.html('<p>No gallery images available.</p>');
            return;
        }

        gallery.forEach((img) => {
            if (!img || !img.thumb || !img.full) return; // Skip invalid entries

            // Ensure tags is an array
            const tags = Array.isArray(img.tags) ? img.tags : [characterName];
            const tagsHTML = tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join(' ');

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

    // Function to load relationships from characterLinks.json
    async function loadCharacterRelationships(characterName) {
        const relationships = await $.getJSON('data/characterLinks.json')
            .then(data => data.relationships.filter(rel => rel.characters.includes(characterName)))
            .catch(error => {
                console.error("Failed to load characterLinks.json:", error);
                return [];
            });

        // Fetch gallery and color data for both characters in each relationship
        const updatedRelationships = await Promise.all(
            relationships.map(async rel => {
                const otherCharacter = rel.characters.find(name => name !== characterName);
                if (!otherCharacter) return rel;

                // Load gallery and color data for the other character
                const otherCharacterFile = await findCharacterFile(otherCharacter);
                if (!otherCharacterFile) return rel;

                const otherCharacterData = await loadCharacterData(otherCharacterFile);
                if (otherCharacterData) {
                    // Use the first gallery image as the thumbnail
                    if (otherCharacterData.gallery && otherCharacterData.gallery.length > 0) {
                        rel.otherCharacterThumb = otherCharacterData.gallery[0].thumb;
                    }

                    // Use the primary and secondary colors from the other character's file
                    rel.otherCharacterPrimaryColor = otherCharacterData.color || '#007bff';
                    rel.otherCharacterSecondaryColor = otherCharacterData.colorSecondary || '#ffffff';
                }

                // Load the current character's color data
                const currentCharacterFile = await findCharacterFile(characterName);
                if (currentCharacterFile) {
                    const currentCharacterData = await loadCharacterData(currentCharacterFile);
                    if (currentCharacterData) {
                        rel.currentCharacterPrimaryColor = currentCharacterData.color || '#007bff';
                        rel.currentCharacterSecondaryColor = currentCharacterData.colorSecondary || '#ffffff';
                    }
                }

                return rel;
            })
        );

        return updatedRelationships;
    }

    // Function to populate character links
    function populateCharacterLinks(relationships, characterName, currentCharacterData) {
        const linksContainer = $('#character-links');
        linksContainer.empty();

        if (!relationships || relationships.length === 0) {
            linksContainer.html('<p>No character links available.</p>');
            return;
        }

        // Get the current character's thumbnail from their gallery
        const currentCharacterThumb = currentCharacterData?.gallery?.[0]?.thumb || 'images/placeholder_thumb.png';

        relationships.forEach(rel => {
            const otherCharacter = rel.characters.find(name => name !== characterName); // Find the other character
            if (!otherCharacter) return; // Skip if no other character is found

            // Always use the current character's colors for the left side
            const leftPrimaryColor = rel.currentCharacterPrimaryColor;
            const leftSecondaryColor = rel.currentCharacterSecondaryColor;

            // Always use the other character's colors for the right side
            const rightPrimaryColor = rel.otherCharacterPrimaryColor;
            const rightSecondaryColor = rel.otherCharacterSecondaryColor;

            // Determine which character is the speaker
            const isCurrentCharacterSpeaker = rel.primaryCharacter === characterName;
            const speakerThought = isCurrentCharacterSpeaker ? rel.thought : rel.quote;
            const listenerThought = isCurrentCharacterSpeaker ? rel.quote : rel.thought;

            const linkHTML = `
    <div class="character-link-container d-flex align-items-center justify-content-center">
        <!-- Main Character -->
        <div class="character-main text-center">
            <img src="${currentCharacterThumb}" alt="${characterName}" class="character-img">
            <div class="speech-bubble left scrollable-bubble" style="background-color: ${leftPrimaryColor}; color: ${leftSecondaryColor};">
                <p>"${speakerThought || "..."}"</p>
            </div>
        </div>

        <!-- Linked Character -->
        <div class="character-linked text-center">
            <a href="_character-template.html?name=${otherCharacter}">
                <img src="${rel.otherCharacterThumb || 'images/placeholder_thumb.png'}" alt="${otherCharacter}" class="character-img">
            </a>
            <div class="speech-bubble right scrollable-bubble" style="background-color: ${rightPrimaryColor}; color: ${rightSecondaryColor};">
                <p>"${listenerThought || "..."}"</p>
            </div>
        </div>
    </div>

    <!-- Relationship Summary -->
    <div class="relationship-summary text-center">
        <p>${rel.summary || `${characterName} knows ${otherCharacter}.`}</p>
    </div>
`;
            linksContainer.append(linkHTML);
        });
    }

    // Enhanced lightbox functionality
    function setupLightbox() {
        $(document).on('click', '.gallery-thumb', function () {
            const fullImageSrc = $(this).data('full') || $(this).attr('src').replace('_thumb', '');
            const credit = $(this).data('credit') || '';
            const tagsStr = $(this).attr('alt') || '';
            const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()) : [];

            // Update lightbox content
            $('#lightboxImage').attr('src', fullImageSrc);
            $('#lightboxCredit').html(credit).toggle(credit !== '');

            // Clear previous character links
            $('#lightboxContent').find('.character-links').remove();

            // Create a container for character links
            const characterLinksContainer = $('<div class="character-links mt-3"></div>');

            // Create buttons for each character based on the tags
            tags.forEach(tag => {
                if (tagToCharacterMapping[tag]) {
                    const folder = tagToCharacterMapping[tag];
                    const iconPath = `images/icons/${tag.toLowerCase()}_icon.png`;

                    const characterLink = $(`
                        <a href="_character-template.html?name=${tag}" class="btn btn-primary me-2 mb-2">
                            <img src="${iconPath}" alt="${tag} Icon" class="character-icon me-2" onerror="this.style.display='none'">
                            View ${tag}
                        </a>`);

                    characterLinksContainer.append(characterLink);
                }
            });

            // Append buttons to lightbox content if there are any
            if (characterLinksContainer.children().length > 0) {
                $('#lightboxContent').append(characterLinksContainer);
            }

            $('#lightboxOverlay').fadeIn();
        });

        // Close lightbox when clicking outside of the content area
        $('#lightboxOverlay').on('click', function (e) {
            if ($(e.target).is('#lightboxOverlay')) {
                $('#lightboxOverlay').fadeOut();
                $('#lightboxContent').find('.character-links').remove();
            }
        });

        $('#lightboxClose').on('click', function () {
            $('#lightboxOverlay').fadeOut();
            $('#lightboxContent').find('.character-links').remove();
        });
    }

    // Setup search functionality
    function setupSearch() {
        $('#searchBar').on('input', function () {
            const searchQuery = $(this).val().toLowerCase();

            if (searchQuery.length === 0) {
                $('.gallery-item').show();
                return;
            }

            $('.gallery-item').each(function () {
                const tags = $(this).data('tags')?.toLowerCase() || '';
                if (tags.includes(searchQuery)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });
    }

    // Main execution flow
    async function init() {
        try {
            setupLightbox();
            setupSearch();

            if (!characterName) {
                $('#loadingIndicator').remove();
                displayCharacterNotFound();
                return;
            }

            const characterFile = await findCharacterFile(characterName);

            if (!characterFile) {
                $('#loadingIndicator').remove();
                displayCharacterNotFound();
                return;
            }

            const characterData = await loadCharacterData(characterFile);
            $('#loadingIndicator').remove();
            displayCharacterData(characterData);

            // Load and populate character relationships
            const relationships = await loadCharacterRelationships(characterName);
            populateCharacterLinks(relationships, characterName, characterData);

        } catch (error) {
            console.error("Error initializing character page:", error);
            $('#loadingIndicator').remove();
            displayCharacterNotFound();
        }
    }

    // Start the initialization process
    init();
});