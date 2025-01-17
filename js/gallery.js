$(document).ready(function () {
    const characters = ['reddick', 'bubba', 'Creed']; // Add all character names here
    const galleryContainer = $('#mainGallery');
    let allImages = [];

    // Load character images and tags
    characters.forEach((character) => {
        const characterFile = `characters/${character}.html`;

        $.get(characterFile, function (response) {
            const characterData = $(response).filter('#character-data').html();
            const data = JSON.parse(characterData);

            if (data && data.gallery && data.gallery.length > 0) {
                data.gallery.forEach((img) => {
                    allImages.push(img); // Store all images for later filtering
                    const tagsHTML = img.tags.map(tag => `<span class="badge bg-secondary">${tag}</span>`).join(' ');

                    const galleryItem = `
                        <div class="col-6 col-sm-4 col-md-3 mb-3 gallery-item" data-tags="${img.tags.join(',')}">
                            <div class="gallery-item-inner">
                                <img src="${img.thumb}" class="img-thumbnail bg-dark gallery-thumb" alt="${data.name}">
                                <div class="gallery-caption">
                                    ${img.caption}
                                    <div class="gallery-tags mt-2">${tagsHTML}</div>
                                </div>
                            </div>
                        </div>`;
                    galleryContainer.append(galleryItem);
                });
            }
        });
    });

    // Lightbox functionality
    $(document).on('click', '.gallery-thumb', function () {
        const fullImageSrc = $(this).attr('src').replace('_thumb', '');
        $('#lightboxImage').attr('src', fullImageSrc);
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
