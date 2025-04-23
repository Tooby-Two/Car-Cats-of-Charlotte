$(document).ready(function () {
    const worldList = $('#worldList');
    const loadingIndicator = $('<div id="loadingIndicator" class="text-center my-5"><div class="spinner-border text-primary" role="status"></div><p>Loading worlds...</p></div>');
    
    // Show loading indicator
    worldList.append(loadingIndicator);
    
    // Function to create world cards
    function createWorldCard(world) {
        // Fallback for missing thumbnail
        const thumbnail = (typeof world.thumbnail === 'string' && world.thumbnail.trim() !== '')
            ? world.thumbnail
            : 'images/default_world.jpg';

        // Create tags from the array
        const tags = Array.isArray(world.tags) 
            ? world.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')
            : '';
        
        // Create featured character thumbnails if available
        let featuredCharacters = '';
        if (Array.isArray(world.featuredCharacters) && world.featuredCharacters.length > 0) {
            featuredCharacters = `
                <div class="featured-characters mt-2">
                    <small class="">Featured Characters:</small>
                    <div class="d-flex mt-1">
                        ${world.featuredCharacters.map(character => {
                            const icon = (typeof character.icon === 'string' && character.icon.trim() !== '')
                                ? character.icon
                                : 'images/default_icon.png';
                            return `
                                <a href="_character-template.html?name=${character.name}" class="me-2" 
                                   data-bs-toggle="tooltip" title="${character.name}">
                                    <img src="${icon}" 
                                         alt="${character.name}" 
                                         class="rounded-circle"
                                         onerror="this.onerror=null;this.src='images/default_icon.png';"
                                         style="width: 30px; height: 30px; object-fit: cover;">
                                </a>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // Create the stats section if available
        let statsSection = '';
        if (world.stats) {
            statsSection = `
                <div class="world-stats small mt-2">
                    <div class="d-flex justify-content-between">
                        <span><i class="bi bi-person"></i> ${world.stats.characters || 0} Characters</span>
                    </div>
                </div>
            `;
        }
        
        // Determine background style - use gradient overlay if specified
        let cardStyle = '';
        if (world.colors && world.colors.primary) {
            cardStyle = `style="background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
                                  linear-gradient(135deg, ${world.colors.primary}, ${world.colors.secondary || '#000'});"`;
        }
        
        return `
            <div class="col-12 mb-4">
                <div class="card world-card h-100" ${cardStyle}>
                    <div class="position-relative">
                        <img src="${thumbnail}" 
                             class="card-img-top" alt="${world.name}"
                             onerror="this.onerror=null;this.src='images/default_world.jpg';">
                        ${world.new ? '<span class="position-absolute top-0 end-0 badge bg-danger m-2">NEW</span>' : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title" style="color:white;">${world.name}</h5>
                        <p class="card-text">${world.tagline || 'A fascinating story world'}</p>
                        <div class="mb-2">${tags}</div>
                        ${statsSection}
                        ${featuredCharacters}
                        <div class="mt-auto pt-3">
                            <a href="${world.link || '#'}" class="btn btn-primary">View World</a>
                            ${world.gallery ? `<a href="${world.gallery}" class="btn btn-outline-light ms-2">Gallery</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to filter worlds
    function setupFilters(worlds) {
        const allTags = new Set();
        worlds.forEach(world => {
            if (Array.isArray(world.tags)) {
                world.tags.forEach(tag => allTags.add(tag));
            }
        });

        if (allTags.size > 0) {
            const filterContainer = $('<div class="filter-container mb-4"><div class="d-flex flex-wrap align-items-center"><span class="me-2">Filter by:</span><div id="tagFilters" class="d-flex flex-wrap"></div></div></div>');
            const tagFilters = filterContainer.find('#tagFilters');

            tagFilters.append(`<button class="btn btn-sm btn-primary me-2 mb-2 filter-btn active" data-filter="all">All</button>`);

            Array.from(allTags).sort().forEach(tag => {
                tagFilters.append(`<button class="btn btn-sm btn-outline-secondary me-2 mb-2 filter-btn" data-filter="${tag}">${tag}</button>`);
            });

            worldList.before(filterContainer);

            $('.filter-btn').on('click', function () {
                const filter = $(this).data('filter');
                $('.filter-btn').removeClass('active');
                $(this).addClass('active');

                if (filter === 'all') {
                    $('.world-card').parent().show();
                } else {
                    $('.world-card').parent().each(function () {
                        const card = $(this);
                        const worldTags = card.find('.badge').map(function () {
                            return $(this).text();
                        }).get();

                        card.toggle(worldTags.includes(filter));
                    });
                }
            });
        }
    }

    // Load world data
    $.getJSON('data/worlds.json')
        .done(function (worlds) {
            loadingIndicator.remove();

            if (!Array.isArray(worlds) || worlds.length === 0) {
                worldList.append('<div class="alert alert-info">No worlds found. Add some worlds to your collection!</div>');
                return;
            }

            // Sort worlds (featured first, then alphabetically)
            worlds.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.name.localeCompare(b.name);
            });

            // Create world cards
            worlds.forEach(world => {
                worldList.append(createWorldCard(world));
            });

            // Setup filtering
            setupFilters(worlds);

            // Initialize tooltips
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            loadingIndicator.remove();
            console.error("Failed to load worlds.json:", textStatus, errorThrown);
            worldList.append(`
                <div class="alert alert-danger">
                    <h4>Error Loading Worlds</h4>
                    <p>There was a problem loading the world data. Please try again later.</p>
                </div>
            `);
        });
});
