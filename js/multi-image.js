(function ( $, window, _ ) {
	"use strict";

	var api = window.wp.customize;

	var ImageFileFrame = {
		open: function () {
			var file_frame = wp.media.frames.file_frame;

			// file frame already created, return
			if ( file_frame ) {
				file_frame.open();
				return;
			}

			// create the file frame
			file_frame = wp.media.frames.file_frame = wp.media( {
				//title: $( this ).data( 'uploader_title' ),
				//button: $( this ).data( 'uploader_button_text' ),
				multiple: true,
				library: {
					type: 'image'
				}
			} );

			// get the selected attachments when user selects
			file_frame.on( 'select', function () {
				var selected = file_frame.state().get( 'selection' ).toJSON(),
					urls = [];
				_.each( selected, function ( attachment ) {
					urls.push( attachment.url );
				} );
				api.Events.trigger( 'multi-image-control:urls-available', urls );
			} );

			// open the file frame
			file_frame.open();
		}
	};

	var MIC_Upload_Button = Backbone.View.extend( {
		tagName: 'a',
		initialize: function () {
			this.$el.on( 'click', ImageFileFrame.open );
		}
	} );

	var MIC_Remove_Button = Backbone.View.extend( {
		tagName: 'a',
		initialize: function () {
			//this.listenTo( this.model, 'change', this.render );
		},
		get_new_html: function () {

		},
		render: function () {
			var args = arguments;
			var html = this.get_new_html();
			this.$el.html( html );
		}
	} );

	var Src = Backbone.Model.extend( {} );

	var Srcs_Collection = Backbone.Collection.extend( {
		model: Src
	} );

	var Thumbnail_View = Backbone.View.extend( {
		template: _.template( '<li class="thumbnail" style="background-image: url(<%= src %>)" data-src="<%= src %>"></li>' ),
		render: function () {
			this.$el.html( this.template( this.model.attributes ) );
			return this;
		}
	} );

	var Thumbnails_View = Backbone.View.extend( {
		tagName: 'ul',
		render: function () {
			var srcs = this.model.models;
			_.each( srcs, function ( src ) {
				var thumbnail = new Thumbnail_View( {model: src} );
				this.$el.append( thumbnail.render().$el );
			}, this );

			return this;
		}
	} );

	api.MultiImage = api.Control.extend( {
		ready: function () {
			new MIC_Upload_Button( {id: 'mic-upload-button'} );
			new MIC_Remove_Button( {model: this, id: 'mic-remove-button'} );

			var srcs = new Srcs_Collection();
			var urls = this.setting.get().split( ',' );
			var thumbnails = new Thumbnails_View( {model: srcs, id: 'mic-thumbnails'} )
			_.each( urls, function ( url ) {
				srcs.add( new Src( {collection: srcs, src: url} ) );
			} );

			var $thumbnails = this.container.find( 'ul.thumbnails' );
			$thumbnails.html( thumbnails.render().$el );
			$thumbnails.sortable().disableSelection();
		}
	} );


	$.extend( api.controlConstructor, {multi_image: api.MultiImage} );

	$( document ).ready( function () {

	} )
})( jQuery, window, window._ );
