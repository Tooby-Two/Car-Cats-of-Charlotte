$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const characterName = urlParams.get('name');
    $('#lightboxOverlay').hide();

    // Load character data from characters.json
    $.getJSON('characters.json', function (data) {
        const characterData = data.find(c => c.name.toLowerCase() === characterName.toLowerCase());

        if (characterData) {
            $('#character-name').text(characterData.name);
            $('#main-character-image').attr('src', characterData.gallery?.[0]?.full);
            $('#character-details').html(`
                <p>${characterData.details}</p>
                ${characterData.uniqueContent}
            `);

            // Populate the gallery
            if (characterData.gallery && characterData.gallery.length > 0) {
                const galleryContainer = $('#characterGallery');
                characterData.gallery.forEach((img) => {
                    const galleryItem = `
                        <div class="col-6 col-sm-4 col-md-3 mb-3">
                            <div class="gallery-item">
                                <img src="${img.thumb}" class="img-thumbnail gallery-thumb" alt="${characterData.name}">
                                <div class="gallery-caption">${img.caption}</div>
                            </div>
                        </div>`;
                    galleryContainer.append(galleryItem);
                });

                // Lightbox functionality
                $('.gallery-thumb').on('click', function () {
                    const index = $('.gallery-thumb').index(this);
                    const fullImageSrc = characterData.gallery[index].full;
                    $('#lightboxImage').attr('src', fullImageSrc);
                    $('#lightboxOverlay').fadeIn();
                });

                $('#lightboxClose, #lightboxOverlay').on('click', function () {
                    $('#lightboxOverlay').fadeOut();
                });
            } else {
                $('#characterGallery').html('<p>No gallery images available for this character.</p>');
            }
        } else {
            $('#character-name').text('Character not found');
            $('#character-details').html('<p>No details available for this character.</p>');
        }
    }).fail(function () {
        $('#character-name').text('Character not found');
        $('#character-details').html('<p>No details available for this character.</p>');
    });
});
