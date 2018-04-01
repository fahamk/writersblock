/*eslint-env browser */
(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(document).on('click', 'a.page-scroll', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Initialize and Configure Scroll Reveal Animation
    window.sr = ScrollReveal();
    sr.reveal('.sr-icons', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 200);
    sr.reveal('.sr-button', {
        duration: 1000,
        delay: 200
    });
    sr.reveal('.sr-contact', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 300);

	$(document).ready( function () {
      $('.table_id').DataTable();
    } );


    // Initialize and Configure Magnific Popup Lightbox Plugin
    $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
        }
    });


    $('#chooseFile').bind('change', function () {
      var filename = $("#chooseFile").val();
      if (/^\s*$/.test(filename)) {
        $(".file-upload").removeClass('active');
        $("#noFile").text("No file chosen...");
      }
      else {
        $(".file-upload").addClass('active');
        $("#noFile").text(filename.replace("C:\\fakepath\\", ""));
      }
    });

    var droppedFiles = false;
    var fileName = '';
    var $dropzone = $('.dropzone');
    var $button = $('.upload-btn');
    var uploading = false;
    var $syncing = $('.syncing');
    var $done = $('.done');
    var $bar = $('.bar');
    var timeOut;

    $dropzone.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
    	e.preventDefault();
    	e.stopPropagation();
    })
    	.on('dragover dragenter', function() {
    	$dropzone.addClass('is-dragover');
    })
    	.on('dragleave dragend drop', function() {
    	$dropzone.removeClass('is-dragover');
    })
    	.on('drop', function(e) {
    	droppedFiles = e.originalEvent.dataTransfer.files;
    	fileName = droppedFiles[0]['name'];
    	$('.filename').html(fileName);
    	$('.dropzone .upload').hide();
    });

    $button.bind('click', function() {
    	startUpload();
    });

    $("input:file").change(function (){
    	fileName = $(this)[0].files[0].name;
    	$('.filename').html(fileName);
    	$('.dropzone .upload').hide();
    });

    function startUpload() {
    	if (!uploading && fileName != '' ) {
    		uploading = true;
    		$button.html('Uploading...');
    		$dropzone.fadeOut();
    		$syncing.addClass('active');
    		$done.addClass('active');
    		$bar.addClass('active');
    		timeoutID = window.setTimeout(showDone, 3200);
    	}
    }

    function showDone() {
    	$button.html('Done');
    }

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-46156385-1', 'cssscript.com');
    ga('send', 'pageview');


})(jQuery); // End of use strict
