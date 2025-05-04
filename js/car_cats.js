$(document).ready(function () {
    const worldName = "car_cats"; // Replace with the actual world name for this page
    const galleryContainer = $('.world-gallery');
    const characterListContainer = $('.character-list');

    $('#lightboxOverlay').hide();
    let tagToCharacterMapping = {};

    // Load tagToCharacterMapping before setting up the lightbox
    $.getJSON('data/tagToCharacterMapping.json', function (mapping) {
        tagToCharacterMapping = mapping;

        // Call the setupLightbox function after the mapping is loaded
        setupLightbox();
    }).fail(function () {
        console.error('❌ Failed to load tagToCharacterMapping.json');
    });

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Function to load gallery images by parsing character HTML files
    function loadGallery() {
        $.getJSON('data/tagToCharacterMapping.json', function (mapping) {
            const characterFiles = Object.entries(mapping)
                .filter(([character, folder]) => folder === worldName)
                .map(([character, folder]) => `characters/${folder}/${character}.html`);

            galleryContainer.empty();

            if (characterFiles.length === 0) {
                galleryContainer.append('<p class="text-muted">No images available for this world.</p>');
                return;
            }

            const uniqueImages = new Set(); // Use a Set to track unique image URLs
            const images = []; // Array to store all unique images

            characterFiles.forEach(file => {
                $.get(file, function (response) {
                    const characterData = $(response).filter('#character-data').html();

                    try {
                        const data = JSON.parse(characterData);

                        if (data && data.gallery) {
                            data.gallery.forEach((img) => {
                                if (!img || !img.thumb || !img.full) return; // Skip invalid entries

                                if (uniqueImages.has(img.full)) {
                                    return; // Skip duplicate images
                                }

                                uniqueImages.add(img.full); // Add the image URL to the Set
                                images.push(img); // Add the image to the array
                            });
                        }
                    } catch (err) {
                        console.error(`❌ Error parsing gallery data from ${file}:`, err);
                    }
                }).fail(function () {
                    console.warn(`⚠️ Failed to load character file: ${file}`);
                });
            });

            // Wait for all files to be processed
            setTimeout(() => {
                // Shuffle the images array
                shuffleArray(images);

                // Append shuffled images to the gallery
                images.forEach((img) => {
                    const tags = Array.isArray(img.tags) ? img.tags : [];
                    const tagsHTML = tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join(' ');

                    const galleryItem = `
                        <div class="col-5 col-sm-4 col-md-3 mb-4 gallery-item" data-tags="${tags.join(',')}">
                            <div class="gallery-item-inner">
                                <img src="${img.thumb}" 
                                     class="img-thumbnail bg-dark gallery-thumb" 
                                     alt="${tags.join(',')}"
                                     data-full="${img.full}" 
                                     data-credit="${img.credit || ''}">
                                <div class="gallery-caption">
                                    ${img.caption || ''}
                                    <div class="gallery-tags mt-2">${tagsHTML}</div>
                                </div>
                            </div>
                        </div>`;
                    galleryContainer.append(galleryItem);
                });
            }, 500); // Adjust timeout as needed to ensure all files are processed
        }).fail(function () {
            galleryContainer.append('<p class="text-danger">Failed to load gallery images.</p>');
        });
    }

    // Initialize tooltips for character icons
    function initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Function to load characters dynamically from tagToCharacterMapping.json
    function loadCharacters() {
        $.getJSON('data/tagToCharacterMapping.json', function (mapping) {
            // Filter characters by worldName
            const characterFiles = Object.entries(mapping)
                .filter(([character, folder]) => folder === worldName)
                .map(([character, folder]) => `characters/${folder}/${character}.html`); // Use folder here

            characterListContainer.empty(); // Clear existing content

            if (characterFiles.length === 0) {
                characterListContainer.append('<p class="text-muted">No characters available for this world.</p>');
                return;
            }

            characterFiles.forEach(file => {
                $.get(file, function (response) {
                    // Extract the JSON data from the <script> tag with id="character-data"
                    const characterData = $(response).filter('#character-data').html();

                    try {
                        const data = JSON.parse(characterData);

                        if (data) {
                            const thumbnail = data.gallery?.[0]?.thumb || 'images/placeholder.png';

                            const characterCard = `
                                <div class="col-6 col-sm-4 col-md-3 mb-3">
                                    <div class="card">
                                        <img src="${thumbnail}" class="card-img-top" alt="${data.name}" onerror="this.src='images/placeholder.png';">
                                        <div class="card-body">
                                            <h5 class="card-title">${data.name}</h5>
                                            <a href="_character-template.html?name=${data.name}" class="btn btn-primary">View Details</a>
                                        </div>
                                    </div>
                                </div>`;
                            characterListContainer.append(characterCard);
                        }
                    } catch (err) {
                        console.error(`❌ Error parsing character data from ${file}:`, err);
                    }
                }).fail(function () {
                    console.warn(`⚠️ Failed to load character file: ${file}`);
                });
            });
        }).fail(function () {
            characterListContainer.append('<p class="text-danger">Failed to load character data.</p>');
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

            // Show the lightbox
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

    function loadTimeline() {
        $.getJSON('data/worlds.json', function (worlds) {
            const currentWorld = worlds.find(world => world.name === "Car Cats of Charlotte");
            if (!currentWorld || !currentWorld.timeline) {
                console.error("Timeline data not found for the current world.");
                return;
            }

            const timelineData = currentWorld.timeline;
            const timelineContainer = $('.timeline');
            const eventTitle = $('#event-title');
            const eventDescription = $('#event-description');
            const eventDate = $('#event-date');
            const eventLocation = $('#event-location');
            const eventCharacters = $('#event-characters');

            timelineContainer.empty();

            timelineData.forEach(event => {
                const timelineEvent = $(`
                    <div class="timeline-event" data-id="${event.id}">
                        <img src="${event.image || ''}" alt="${event.title}">
                        <p>${event.title}</p>
                    </div>
                `);

                timelineEvent.on('click', function () {
                    eventTitle.text(event.title);
                    eventDescription.text(event.description);
                    eventDate.text(event.date || 'Unknown Date');
                    eventLocation.text(event.location || 'Unknown Location');

                    eventCharacters.empty();
                    if (event.characters && event.characters.length > 0) {
                        event.characters.forEach(character => {
                            const characterIcon = $(`
                                <a href="_character-template.html?name=${character.name}" class="me-2">
                                    <img src="${character.icon}" alt="${character.name}" class="character-icon" 
                                         title="${character.name}" data-bs-toggle="tooltip">
                                </a>
                            `);
                            eventCharacters.append(characterIcon);
                        });

                        // Initialize tooltips for the newly added icons
                        initializeTooltips();
                    } else {
                        eventCharacters.html('<p>No characters linked to this event.</p>');
                    }
                });

                timelineContainer.append(timelineEvent);
            });

            if (timelineData.length > 0) {
                const firstEvent = timelineData[0];
                eventTitle.text(firstEvent.title);
                eventDescription.text(firstEvent.description);
                eventDate.text(firstEvent.date || 'Unknown Date');
                eventLocation.text(firstEvent.location || 'Unknown Location');

                eventCharacters.empty();
                if (firstEvent.characters && firstEvent.characters.length > 0) {
                    firstEvent.characters.forEach(character => {
                        const characterIcon = $(`
                            <a href="_character-template.html?name=${character.name}" class="me-2">
                                <img src="${character.icon}" alt="${character.name}" class="character-icon" 
                                     title="${character.name}" data-bs-toggle="tooltip">
                            </a>
                        `);
                        eventCharacters.append(characterIcon);
                    });

                    // Initialize tooltips for the first event's icons
                    initializeTooltips();
                } else {
                    eventCharacters.html('<p>No characters linked to this event.</p>');
                }
            }
        }).fail(function () {
            console.error("Failed to load worlds.json.");
        });
    }

    function loadLocations() {
        $.getJSON('data/worlds.json', function (worlds) {
            const currentWorld = worlds.find(world => world.name === "Car Cats of Charlotte");
            if (!currentWorld || !currentWorld.locations) {
                console.error("Locations data not found for the current world.");
                return;
            }

            const locationsContainer = $('.location-list');
            locationsContainer.empty();

            currentWorld.locations.forEach(location => {
                const locationCard = $(`
                    <div class="location-card d-flex align-items-center">
                        <div class="location-text flex-grow-1">
                            <h3>${location.name}</h3>
                            <p>${location.description}</p>
                        </div>
                        <div class="location-image">
                            <img src="${location.image}" alt="${location.name}" class="img-fluid rounded">
                        </div>
                    </div>
                `);
                locationsContainer.append(locationCard);
            });
        }).fail(function () {
            console.error("Failed to load worlds.json.");
        });
    }

    loadLocations();

    // Call the loadTimeline function when the page is ready
    loadTimeline();

    // Call the setupLightbox function
    setupLightbox();

    // Load content when the page is ready
    loadGallery();
    loadCharacters();
});