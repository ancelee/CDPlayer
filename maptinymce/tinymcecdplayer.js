/** 
 * CDPlayer in TinyMCE
 * http://www.ancelee.com
 */
(function() {
	tinymce.PluginManager.add('my_mce_button', function( editor, url ) {
		editor.addButton( 'my_mce_button', {
			text: 'CDPlayer',
			icon: false,
			onclick: function() {
				editor.windowManager.open( {
					title: '插入CDPlayer播放器',
					body: [
						{
							type: 'textbox',
							name: 'url',
							label: 'Mp3地址',
							minWidth: 300,
							value: 'http://'
						},
						{
							type: 'textbox',
							name: 'thumb',
							label: '封面图地址',
							minWidth: 300,
							value: 'http://'
						},
						{
							type: 'textbox',
							name: 'songname',
							label: '歌曲名',
							value: '',
							minWidth: 150
						},
						{
							type: 'textbox',
							name: 'artist',
							label: '歌手名',
							value: '',
							minWidth: 150
						},
						{
							type: 'checkbox',
							name: 'autoplay',
							label: '自动播放',
							checked: false,
							text: '是'
						},
						{
							type: 'checkbox',
							name: 'loops',
							label: '循环播放',
							checked: false,
							text: '是'
						}
					],
					onsubmit: function( e ) {
						editor.insertContent( '[cdplayer url="' + e.data.url + '" img="' + e.data.thumb + '" title="' + e.data.songname + '" artist="' + e.data.artist + '" autoplay="' + e.data.autoplay + '" loops="' + e.data.loops + '"]');
					}
				});
			}
		});
		editor.onNodeChange.add(function(ed) {
			var selection = ed.selection.getNode();
			console.log(jQuery(selection));
			// var btnId = typeof ed.controlManager.buttons != "undefined" ? ed.controlManager.buttons.maplayerbutton._id : ed.controlManager.get("maplayerbutton").id;

			// var disable = false;
			// ed.isValidURL = false;
			// ed.isHref = false;

			// jQuery("#"+btnId).css({opacity:.5, border:"1px solid transparent"});

			// if (jQuery(selection).is("a[href *= '.mp3']") || jQuery(selection).find("a[href *= '.mp3']").lenght>0 || jQuery(selection).prev().is("a[href *= '.mp3']")) {
			// ed.isHref = true;
			// ed.isValidURL = true;
			// disable = false;
			// jQuery("#"+btnId).css({opacity:1});
			// } else if(jQuery(selection).is("a") || jQuery(selection).find("a").lenght>0 || jQuery(selection).prev().is("a" )) {
			// 	ed.isHref = true;
			// }
			// ed.controlManager.setDisabled("maplayerbutton", disable);
		});
	});
})();
