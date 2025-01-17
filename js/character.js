$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const characterName = urlParams.get('name');
    $('#lightboxOverlay').hide();

    const characterFile = `characters/${characterName}.html`; // Ensure the path is correct
    $.get(characterFile, function (response) {
        const characterData = $(response).filter('#character-data').html();
        const data = JSON.parse(characterData);

        if (data) {
            $('#character-name').text(data.name);
            $('#main-character-image').attr('src', data.gallery?.[0]?.full);
            $('#character-details').html(`
                <p>${data.details}</p>
                ${data.uniqueContent}
            `);

            // Populate the gallery
            if (data.gallery && data.gallery.length > 0) {
                const galleryContainer = $('#characterGallery');
                data.gallery.forEach((img) => {
                    const galleryItem = `
                        <div class="col-6 col-sm-4 col-md-3 mb-3">
                            <div class="gallery-item">
                                <img src="${img.thumb}" class="img-thumbnail gallery-thumb" alt="${data.name}">
                                <div class="gallery-caption">${img.caption}</div>
                            </div>
                        </div>`;
                    galleryContainer.append(galleryItem);
                });

                // Lightbox functionality
                $('.gallery-thumb').on('click', function () {
                    const index = $('.gallery-thumb').index(this);
                    const fullImageSrc = data.gallery[index].full;
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
