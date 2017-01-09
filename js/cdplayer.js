/** 
 * alplayer 1.0
 * www.ancelee.com
 */
function BasicMP3Player() {
	var self = this,
		pl = this,
		sm = soundManager, // soundManager instance
		isTouchDevice = (navigator.userAgent.match(/ipad|iphone/i)),
		isIE = (navigator.userAgent.match(/msie/i));
	this.excludeClass = 'button-exclude'; // CSS class for ignoring MP3 links
	this.links = [];
	this.sounds = [];
	this.soundsByURL = {};
	this.indexByURL = {};
	this.lastSound = null;
	this.soundCount = 0;

	this.config = {
		// configuration options
		playNext: true, // stop after one sound, or play through list until end
		autoPlay: true // start playing the first sound right away
	};

	this.css = {
		// CSS class names appended to link during various states
		sDefault: 'sm2_button', // default state
		sLoading: 'sm2_loading',
		sPlaying: 'sm2_playing',
		sStoped: 'sm2_stoped',
		sPaused: 'sm2_paused',
		sBuffering: 'sm2_buffering',
	};

	// event + DOM utils

	this.includeClass = this.css.sDefault;

	this.addEventHandler = (typeof window.addEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
		return o.addEventListener(evtName, evtHandler, false);
	} : function(o, evtName, evtHandler) {
		o.attachEvent('on' + evtName, evtHandler);
	});

	this.removeEventHandler = (typeof window.removeEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
		return o.removeEventListener(evtName, evtHandler, false);
	} : function(o, evtName, evtHandler) {
		return o.detachEvent('on' + evtName, evtHandler);
	});

	this.classContains = function(o, cStr) {
		return (typeof(o.className) !== 'undefined' ? o.className.match(new RegExp('(\\s|^)' + cStr + '(\\s|$)')) : false);
	};

	this.addClass = function(o, cStr) {
		if (!o || !cStr || self.classContains(o, cStr)) {
			return false;
		}
		o.className = (o.className ? o.className + ' ' : '') + cStr;
	};

	this.removeClass = function(o, cStr) {
		if (!o || !cStr || !self.classContains(o, cStr)) {
			return false;
		}
		o.className = o.className.replace(new RegExp('( ' + cStr + ')|(' + cStr + ')', 'g'), '');
	};

	this.getSoundByURL = function(sURL) {
		return (typeof self.soundsByURL[sURL] !== 'undefined' ? self.soundsByURL[sURL] : null);
	};

	this.isChildOfNode = function(o, sNodeName) {
		if (!o || !o.parentNode) {
			return false;
		}
		sNodeName = sNodeName.toLowerCase();
		do {
			o = o.parentNode;
		} while (o && o.parentNode && o.nodeName.toLowerCase() !== sNodeName);
		return (o.nodeName.toLowerCase() === sNodeName ? o : null);
	};

	this.updatePlaying = function() {
		var timeNow;
		if (this._data.className === self.css.sStoped) {
			timeNow = "00 : 00";
		} else {
			timeNow = (self.getTime(this.position, true));
		}
		jQuery(this._data.oLink).next().find(".time-bar").text(timeNow);
	};

	this.getTime = function(nMSec, bAsString) {
		// convert milliseconds to mm:ss, return as object literal or string
		var nSec = Math.floor(nMSec / 1000),
			min = Math.floor(nSec / 60),
			sec = nSec - (min * 60);
		// if (min === 0 && sec === 0) return null; // return 0:00 as null
		return (bAsString ? ((min < 10 ? '0' + min : min) + ' : ' + (sec < 10 ? '0' + sec : sec)) : {
			'min': min,
			'sec': sec
		});
	};

	this.events = {
		play: function() {
			//pl.removeClass(this._data.oLink, this._data.className);
			jQuery(this._data.oLink).removeClass(this._data.className);
			//pl.removeClass(this._data.oLink, self.css.sStoped);
			jQuery(this._data.oLink).removeClass(self.css.sStoped);
			this._data.className = pl.css.sPlaying;
			jQuery(this._data.oLink).addClass(this._data.className);
			//console.log("player is playing")
		},

		stop: function() {
			jQuery(this._data.oLink).removeClass(this._data.className);
			this._data.className = self.css.sStoped;
			jQuery(this._data.oLink).addClass(self.css.sStoped);
			jQuery(".position-bar").width(0); //All positions are set to the home position
			pl.updatePlaying.apply(this);
			//console.log("player has stoped")
		},

		pause: function() {
			jQuery(this._data.oLink).removeClass(this._data.className);
			this._data.className = pl.css.sPaused;
			jQuery(this._data.oLink).addClass(this._data.className);
			//console.log("player has paused")
		},

		resume: function() {
			jQuery(this._data.oLink).removeClass(this._data.className);
			this._data.className = pl.css.sPlaying;
			jQuery(this._data.oLink).addClass(this._data.className);
			//console.log("player has resumeed")
		},

		suspend: function(){
			//console.log("player has suspend");
		},

		finish: function() {
			pl.removeClass(this._data.oLink, this._data.className);
			pl.addClass(this._data.oLink, self.css.sStoped);
			jQuery(".position-bar").width(0);
			this._data.className = self.css.sStoped;
			if (pl.config.playNext) {
				var nextLink = (pl.indexByURL[this._data.oLink.getAttribute('data-url')] + 1);
				if (nextLink < pl.links.length && self.config.autoPlay) {
					pl.handleClick({
						'currentTarget': pl.links[nextLink]
					}, true);
				}
			};
			pl.updatePlaying.apply(this);
		},
		whileloading: function() {
			var $ifo = jQuery(this._data.oLink).next();
			$ifo.find(".loaded-bar").width((this.duration / this.durationEstimate * 100).toFixed(2) + "%");
		},
		whileplaying: function() {
			var $ifo = jQuery(this._data.oLink).next();
			$ifo.find(".position-bar").width((this.position / this.durationEstimate * 100).toFixed(2) + "%");
			pl.updatePlaying.apply(this);
		},
		bufferchange: function() {
			if (this.isBuffering) {
				jQuery(this._data.oLink).find(".player-loading").show();
				jQuery(this._data.oLink).addClass(self.css.sBuffering);
			} else {
				jQuery(this._data.oLink).find(".player-loading").hide();
				jQuery(this._data.oLink).removeClass(self.css.sBuffering);
			}
		}
	};

	this.stopEvent = function(e) {
		if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
			e.preventDefault();
		} else if (typeof window.event !== 'undefined') {
			window.event.returnValue = false;
		}
		return false;
	};

	this.getTheDamnLink = (isIE) ? function(e) {
		// I really didn't want to have to do this.
		return (e && e.currentTarget ? e.currentTarget : window.event.srcElement);
	} : function(e) {
		return e.currentTarget;
	};

	this.handleClick = function(e, s) {
		var status = s || undefined;
		!status ? self.config.autoPlay = false : self.config.autoPlay = true;
		// a sound link was clicked
		if (typeof e.button !== 'undefined' && e.button > 1) {
			// ignore right-click
			return true;
		}
		var o = self.getTheDamnLink(e),
			sURL,
			soundURL,
			loops,
			volume,
			thisSound;

		if (!self.classContains(o, self.css.sDefault)) {
			return true;
		}
		sURL = o.getAttribute('data-url');
		var ss = soundManager.canPlayLink(o, sURL);
		if (!soundManager.canPlayLink(o, sURL) || self.classContains(o, self.excludeClass)) {
			return true; // pass-thru for non-MP3/non-links
		}
		if (!self.classContains(o, self.includeClass)) {
			return true;
		}
		sm._writeDebug('handleClick()');
		//soundURL = (o.href);
		soundURL = (o.getAttribute("data-url"));
		loops = (o.getAttribute("data-loops") == "true" ? 2 : 1);
		volume = Number(o.getAttribute("data-volume"));

		thisSound = self.getSoundByURL(soundURL);
		if (thisSound) {
			// already exists
			if (thisSound === self.lastSound) {
				// and was playing (or paused)
				thisSound.togglePause();
			} else {
				// different sound
				thisSound.togglePause(); // start playing current
				sm._writeDebug('sound different than last sound: ' + self.lastSound.id);
				if (self.lastSound) {
					self.stopSound(self.lastSound);
				}
			}
		} else {
			// create sound
			thisSound = sm.createSound({
				id: 'basicMP3Sound' + (self.soundCount++),
				url: soundURL,
				loops: loops,
				volume: volume,
				onplay: self.events.play,
				onstop: self.events.stop,
				onpause: self.events.pause,
				onresume: self.events.resume,
				onfinish: self.events.finish,
				onsuspend: self.events.suspend,
				onbufferchange:self.events.bufferchange,
				whileloading: self.events.whileloading,
				whileplaying: self.events.whileplaying,
				type: (o.type || null)
			});

			// tack on some custom data
			thisSound._data = {
				oLink: o, // DOM node for reference within SM2 object event handlers
				className: self.css.sPlaying
			};
			self.soundsByURL[soundURL] = thisSound;
			self.sounds.push(thisSound);
			if (self.lastSound) {
				// stop last sound
				self.stopSound(self.lastSound);
			}
			thisSound.play();
		}
		self.lastSound = thisSound; // reference for next call
		return self.stopEvent(e);
	};

	this.setPosition = function(e){
		var oSound = self.getSoundByURL(jQuery(this).parents(".songinfo-box").eq(0).prev().attr("data-url"));
		var totalWidth = jQuery(this).width();
		var toWidth = e.offsetX;
		if(oSound) oSound.setPosition(oSound.durationEstimate*(toWidth/totalWidth));
	};

	this.stopSound = function(oSound) {
		soundManager.stop(oSound.id);
		if (!isTouchDevice) {
			soundManager.unload(oSound.id);
		}
	};

	this.destroySound = function(){
		if($.isEmptyObject(self.soundsByURL)) return;
		for(x in self.soundsByURL){
			self.soundsByURL[x].destruct();
		};
		self.soundsByURL = {};
	};

	this.init = function() {
		sm._writeDebug('basicMP3Player.init()');
		var i, j,
			foundItems = 0,
			listsItems = 0,
			oLinks = document.querySelectorAll(".Js_player"),
			oCover;
		// grab all links, look for .mp3
		for (i = 0, j = oLinks.length; i < j; i++) {
			//if (self.classContains(oLinks[i],self.css.sDefault) && !self.classContains(oLinks[i],self.excludeClass)) {
			self.addClass(oLinks[i], self.css.sDefault); // add default CSS decoration - good if you're lazy and want ALL MP3/playable links to do this
			self.addClass(oLinks[i], self.css.sStoped);
			self.links[foundItems] = (oLinks[i]);
			if (oLinks[i].getAttribute('data-autoplay') == "true") {
				self.indexByURL[oLinks[i].getAttribute('data-url')] = foundItems; // hack for indexing
				foundItems++;
			}
			self.addEventHandler(oLinks[i], 'click', self.handleClick);
			oCover = jQuery(oLinks[i]).next().find(".whole-bar");
			jQuery(oCover).on("click", self.setPosition);
			//}
		}
		if (foundItems > 0) {
			if (self.config.autoPlay) {
				var autoPlay_status = true;
				self.handleClick({
					currentTarget: self.links[0],
					preventDefault: function() {}
				}, autoPlay_status);
			}
		}
		sm._writeDebug('basicMP3Player.init(): Found ' + foundItems + ' relevant items.');
	};

	if(IS_USED_PJAX && IS_USED_PJAX==="true"){
		//针对pjax加载内容区重载播放器
		jQuery(document).on('pjax:complete', reload);
		jQuery(window).on('popstate', reload)
		function reload(){
			self.destroySound();
			self.init();
		}
	};
	this.init();
}

function initSM(){
	var basicMP3Player = null;
	soundManager.setup({
		html5PollingInterval: 50,
		flashVersion: 9,
		url: '../swf/',
		preferFlash: false,
		onready: function() {
			basicMP3Player = new BasicMP3Player();
		}
	});
};
initSM();


