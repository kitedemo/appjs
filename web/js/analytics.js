/**
 * Kik Cards
 * Copyright (c) 2012 Kik Interactive, http://kik.com
 * All rights reserved
*/



/* Initializes the google analytics script after window.onload */
(function (w, d) {

	// create _gaq early so we can setup events

	var _gaq = w._gaq = [];
	_gaq.push(['_setAccount', 'UA-40353233-1']);
	_gaq.push(['_trackPageview']);

	window.addEventListener('error', function (e) {
		var errorFile    = (e.filename || window.location.href),
			errorLine    = e.lineno || 0,
			errorMessage = e.message || '';

		w._gaq.push([
			'_trackEvent' ,
			'Error'       ,
			errorFile     ,
			errorMessage  ,
			errorLine
		]);
	}, false);

	// track load time and Cards.js related metrics
	if (cards.metrics && cards.metrics.enableGoogleAnalytics) {
		cards.metrics.enableGoogleAnalytics();
	}

	if (App.enableGoogleAnalytics) {
		App.enableGoogleAnalytics();
	}

	// wait until all other assets are loaded to not block pageLoaded
	cards.ready(function () {
			var ga = d.createElement('script');
			ga.async = true;
			ga.defer = true;
			ga.id = 'ga';
			ga.src = '//www.google-analytics.com/ga.js';
			var s = d.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
	}, false);
})(window, document);