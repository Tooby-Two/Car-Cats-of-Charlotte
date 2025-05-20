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
                .filter(([character, info]) => info.folder === "car_cats" && info.subfolder === "charlotte")
                .map(([character, info]) => `characters/${info.folder}/${info.subfolder}/${character}.html`);

            galleryContainer.empty();

            if (characterFiles.length === 0) {
                galleryContainer.append('<p class="text-muted">No images available for this world.</p>');
                return;
            }

            const uniqueImages = new Set();
            const images = [];

            const fetchPromises = characterFiles.map(file =>
                $.get(file).then(response => {
                    const characterData = $(response).filter('#character-data').html();
                    try {
                        const data = JSON.parse(characterData);
                        if (data && data.gallery) {
                            data.gallery.forEach(img => {
                                if (!img || !img.thumb || !img.full) return;
                                if (!uniqueImages.has(img.full)) {
                                    uniqueImages.add(img.full);
                                    images.push(img);
                                }
                            });
                        }
                    } catch (err) {
                        console.error(`❌ Error parsing gallery data from ${file}:`, err);
                    }
                }).fail(() => {
                    console.warn(`⚠️ Failed to load character file: ${file}`);
                })
            );

            Promise.all(fetchPromises).then(() => {
                shuffleArray(images);

                images.forEach(img => {
                    const tags = Array.isArray(img.tags) ? img.tags : [];
                    const tagsHTML = tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join(' ');

                    const galleryItem = `<div class="col-5 col-sm-4 col-md-3 mb-4 gallery-item" data-tags="${tags.join(',')}">
                        <div class="gallery-item-inner">
                            <img src="${img.thumb}" class="img-thumbnail bg-dark gallery-thumb" alt="${tags.join(',')}" data-full="${img.full}" data-credit="${img.credit || ''}">
                            <div class="gallery-caption">${img.caption || ''}<div class="gallery-tags mt-2">${tagsHTML}</div></div>
                        </div>
                    </div>`;
                    galleryContainer.append(galleryItem);
                });
            }).catch(err => {
                console.error('❌ Error loading gallery:', err);
                galleryContainer.append('<p class="text-danger">Failed to load gallery images.</p>');
            });
        }).fail(() => {
            galleryContainer.append('<p class="text-danger">Failed to load tagToCharacterMapping.json.</p>');
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
            const characterFiles = Object.entries(mapping)
                .filter(([character, info]) => info.folder === "car_cats" && info.subfolder === "charlotte")
                .map(([character, info]) => `characters/${info.folder}/${info.subfolder}/${character}.html`);

            characterListContainer.empty();

            if (characterFiles.length === 0) {
                characterListContainer.append('<p class="text-muted">No characters available for this world.</p>');
                return;
            }

            characterFiles.forEach(file => {
                $.get(file, function (response) {
                    const characterData = $(response).filter('#character-data').html();

                    try {
                        const data = JSON.parse(characterData);

                        if (data) {
                            const thumbnail = data.gallery?.[0]?.thumb || 'images/placeholder.png';

                            const characterCard = `<div class="col-6 col-sm-4 col-md-3 mb-3">
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
            const currentWorld = worlds.find(world => world.name === "Car Cats");
            if (!currentWorld || !currentWorld.timeline) {
                console.error("Timeline data not found for the current world.");
                return;
            }

            const timelineData = currentWorld.timeline.filter(event => event.region === "Charlotte");
            const timelineContainer = $('.timeline');
            const eventTitle = $('#event-title');
            const eventDescription = $('#event-description');
            const eventDate = $('#event-date');
            const eventLocation = $('#event-location');
            const eventCharacters = $('#event-characters');

            timelineContainer.empty();

            timelineData.forEach(event => {
                const timelineEvent = $(`<div class="timeline-event" data-id="${event.id}">
                    <img src="${event.image || ''}" alt="${event.title}">
                    <p>${event.title}</p>
                </div>`);

                timelineEvent.on('click', function () {
                    eventTitle.text(event.title);
                    eventDescription.text(event.description);
                    eventDate.text(event.date || 'Unknown Date');
                    eventLocation.text(event.location || 'Unknown Location');

                    eventCharacters.empty();
                    if (event.characters && event.characters.length > 0) {
                        event.characters.forEach(character => {
                            const characterIcon = $(`<a href="_character-template.html?name=${character.name}" class="me-2">
                                <img src="${character.icon}" alt="${character.name}" class="character-icon" 
                                     title="${character.name}" data-bs-toggle="tooltip">
                            </a>`);
                            eventCharacters.append(characterIcon);
                        });

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
                        const characterIcon = $(`<a href="_character-template.html?name=${character.name}" class="me-2">
                            <img src="${character.icon}" alt="${character.name}" class="character-icon" 
                                 title="${character.name}" data-bs-toggle="tooltip">
                        </a>`);
                        eventCharacters.append(characterIcon);
                    });

                    initializeTooltips();
                } else {
                    eventCharacters.html('<p>No characters linked to this event.</p>');
                }
            }
        }).fail(function () {
            console.error("Failed to load worlds.json.");
        });
    }

    function populateWorldCharacterLinks(worldName) {
        $.getJSON('data/characterLinks.json', async function (data) {
            const linksContainer = $('#character-links');
            linksContainer.empty();

            // Filter relationships by the current world and region
            const relationships = data.relationships.filter(rel => rel.world === worldName && rel.region === "Charlotte");

            if (!relationships || relationships.length === 0) {
                linksContainer.html('<p>No character links available for this region.</p>');
                return;
            }

            for (const rel of relationships) {
                const [character1, character2] = rel.characters;

                // Fetch data for both characters
                const character1Data = await fetchCharacterData(character1);
                const character2Data = await fetchCharacterData(character2);

                // Use the first gallery image or fallback to placeholder
                const character1Image = character1Data?.gallery?.[0]?.thumb || 'images/placeholder_thumb.png';
                const character2Image = character2Data?.gallery?.[0]?.thumb || 'images/placeholder_thumb.png';

                // Use primary and secondary colors or fallback to defaults
                const character1PrimaryColor = character1Data?.color || '#007bff';
                const character1SecondaryColor = character1Data?.colorSecondary || '#ffffff';
                const character2PrimaryColor = character2Data?.color || '#007bff';
                const character2SecondaryColor = character2Data?.colorSecondary || '#ffffff';

                // Create a unique ID for this relationship
                const relationshipId = `rel-${character1.replace(/\s+/g, '-')}-${character2.replace(/\s+/g, '-')}`;


                // Generate the HTML for the character link
                const linkHTML = `
                    <div class="character-link-card mb-3">
                        <!-- Visible header with character images and names -->
                        <div class="card">
                            <div class="card-header d-flex align-items-center" role="button" data-bs-toggle="collapse" data-bs-target="#${relationshipId}" aria-expanded="false" aria-controls="${relationshipId}">
                                <div class="d-flex align-items-center me-auto">
                                    <img src="${character1Image}" alt="${character1}" class="character-thumbnail me-2" style="border-color: ${character1Data?.color || '#007bff'};">
                                    <span class="character-name">${character1}</span>
                                </div>
                                <div class="relationship-indicator mx-2">
                                    <i class="bi bi-arrow-left-right"></i>
                                </div>
                                <div class="d-flex align-items-center ms-auto">
                                    <span class="character-name">${character2}</span>
                                    <img src="${character2Image}" alt="${character2}" class="character-thumbnail ms-2" style="border-color: ${character2Data?.color || '#007bff'};">
                                </div>
                                <i class="bi bi-chevron-down ms-3 toggle-icon"></i>
                            </div>
                            
                            <!-- Collapsible content -->
                            <div id="${relationshipId}" class="collapse">
                                <div class="card-body">
                                        <div class="row character-content">
                                        <!-- First Character -->
                                        <div class="col-md-6 text-center character-column">
                                            <a href="_character-template.html?name=${character1}">
                                                <img src="${character1Image}" alt="${character1}" class="character-img mb-2">
                                                <h5>${character1}</h5>
                                            </a>
                                            <div class="speech-bubble scrollable-bubble" style="background-color: ${character1Data?.color || '#007bff'}; color: ${character1Data?.colorSecondary || '#ffffff'};">
                                                <p>"${rel.thought || '...'}"</p>
                                            </div>
                                        </div>
                                        
                                        <!-- Second Character -->
                                        <div class="col-md-6 text-center character-column">
                                            <a href="_character-template.html?name=${character2}">
                                                <img src="${character2Image}" alt="${character2}" class="character-img mb-2">
                                                <h5>${character2}</h5>
                                            </a>
                                            <div class="speech-bubble scrollable-bubble" style="background-color: ${character2Data?.color || '#007bff'}; color: ${character2Data?.colorSecondary || '#ffffff'};">
                                                <p>"${rel.quote || '...'}"</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Relationship Summary Row -->
                                    <div class="row mt-4">
                                        <div class="col-12">
                                            <div class="relationship-summary text-center p-3">
                                                <p class="mb-0">${rel.summary || `${character1} knows ${character2}.`}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                linksContainer.append(linkHTML);
            }
        }).fail(function () {
            console.error("Failed to load characterLinks.json.");
            $('#character-links').html('<p>Error loading character links.</p>');
        });
    }

    async function fetchCharacterData(characterName) {
        try {
            // Fetch the mapping to get folder and subfolder info
            const mapping = await $.getJSON('data/tagToCharacterMapping.json');
            const characterInfo = mapping[characterName];

            if (!characterInfo) {
                console.error(`Character ${characterName} not found in tagToCharacterMapping.json.`);
                return null;
            }

            // Construct the file path dynamically
            const folder = characterInfo.folder || 'car_cats';
            const subfolder = characterInfo.subfolder ? `/${characterInfo.subfolder}` : '';
            const characterFile = `characters/${folder}/${subfolder}/${characterName}.html`;

            // Fetch the character file
            const response = await $.get(characterFile);
            const characterData = $(response).filter('#character-data').html();
            return JSON.parse(characterData);
        } catch (error) {
            console.error(`Failed to fetch data for ${characterName}:`, error);
            return null;
        }
    }

    function loadLocations() {
        $.getJSON('data/worlds.json', function (worlds) {
            const currentWorld = worlds.find(world => world.name === "Car Cats");
            if (!currentWorld || !currentWorld.locations) {
                console.error("Locations data not found for the current world.");
                return;
            }

            const locationsData = currentWorld.locations.filter(location => location.region === "Charlotte");
            const locationsContainer = $('.location-list');
            locationsContainer.empty();

            locationsData.forEach(location => {
                const locationCard = $(`<div class="location-card d-flex align-items-center">
                    <div class="location-text flex-grow-1">
                        <h3>${location.name}</h3>
                        <p>${location.description}</p>
                    </div>
                    <div class="location-image">
                        <img src="${location.image}" alt="${location.name}" class="img-fluid rounded">
                    </div>
                </div>`);
                locationsContainer.append(locationCard);
            });
        }).fail(function () {
            console.error("Failed to load worlds.json.");
        });
    }

    // Call the setupLightbox function
    setupLightbox();

    // Load content when the page is ready
    loadGallery();
    loadCharacters();
    loadTimeline();
    loadLocations();
    populateWorldCharacterLinks(worldName);

});