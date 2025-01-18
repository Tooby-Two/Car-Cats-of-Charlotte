$(document).ready(function () {
    const folders = ['car_cats', 'jefferyverse', 'other']; // Folder names to search
    const galleryContainer = $('#mainGallery');
    const urlParams = new URLSearchParams(window.location.search);
    const characterName = urlParams.get('name');
    $('#lightboxOverlay').hide();

    // Function to search for character in multiple folders
    const searchCharacterInFolders = (name) => {
        let characterFile = '';
        let found = false;

        // Iterate through folders to find the character file
        for (const folder of folders) {
            characterFile = `characters/${folder}/${name}.html`;
            $.ajax({
                url: characterFile,
                type: 'HEAD', // Send a HEAD request to check if the file exists
                async: false, // Make it synchronous so it doesn't continue until the file is found
                success: function () {
                    found = true;
                },
                error: function () {
                    // Do nothing on error; just continue to check other folders
                }
            });

            if (found) break; // Exit the loop once the file is found
        }

        return found ? characterFile : null; // Return the file path if found, otherwise null
    };

    const characterFile = searchCharacterInFolders(characterName); // Search through folders for the character file

    if (characterFile) {
        // If the character file is found, load the content
        $.get(characterFile, function (response) {
            const characterData = $(response).filter('#character-data').html();
            const data = JSON.parse(characterData);

            if (data) {
                $('#character-name').text(data.name);
                $('#character-designer').html(data.designer);
                $('#main-character-image').attr('src', data.gallery?.[0]?.full);
                $('#character-details').html(data.details);
                $('#character-appearance').html(data.appearance);
                $('#character-personality').html(data.personality);
                $('#character-backstory').html(data.backstory);
                $('#uniqueContent').html(data.uniqueContent);

                document.documentElement.style.setProperty('--primary-color', data.color);
                document.documentElement.style.setProperty('--secondary-color', data.colorSecondary);
                
                $('.sidebar').css('background-image', `url(${data.sidebarImage})`);

                


                // Populate the gallery
                if (data.gallery && data.gallery.length > 0) {
                    const galleryContainer = $('#indivCharacterGallery');
                    data.gallery.forEach((img) => {
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
                                    </div>
                                </div>
                            </div>`;
                        galleryContainer.append(galleryItem);
                    });

                    // Lightbox functionality
    $(document).on('click', '.gallery-thumb', function () {
        const fullImageSrc = $(this).attr('src').replace('_thumb', '')
        const credit = $(this).data('credit');
        $('#lightboxImage').attr('src', fullImageSrc);
        $('#lightboxCredit').html(credit).show();
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
    } else {
        // If no character file is found, show an error
        $('#character-name').text('Character not found');
        $('#character-details').html('<p>No details available for this character.</p>');
    }
});
