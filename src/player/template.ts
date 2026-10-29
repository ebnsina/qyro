import { icons } from '../controls/icons.js';

const morph = `<span class="morph"><span class="i-play">${icons.play}</span><span class="i-pause">${icons.pause}</span><span class="i-replay">${icons.replay}</span></span>`;

// title="" stops the host's title attribute from showing as a tooltip over the whole player.
export const template = `
<div class="root" part="root" title="" data-paused data-fresh>
	<div class="stage" part="stage"><video part="video" preload="metadata"></video></div>
	<div class="scrim" aria-hidden="true"></div>
	<div class="surface" aria-hidden="true">
		<div class="ripple" data-side="back"><span class="ripple-wave"></span><span class="ripple-label">${icons.backward}<span>10 seconds</span></span></div>
		<div class="ripple" data-side="forward"><span class="ripple-wave"></span><span class="ripple-label">${icons.forward}<span>10 seconds</span></span></div>
	</div>
	<div class="top" part="top-bar"><div class="title" part="title"></div></div>
	<div class="live live-corner glass" part="live-badge-corner" aria-hidden="true"><span class="dot"></span><span class="live-label">Live</span></div>
	<div class="center">
		<button class="glass round skip" data-action="back" part="skip-back-button" aria-label="Back 10 seconds" tabindex="-1">${icons.backward}</button>
		<button class="glass round big-play" part="big-play-button" aria-label="Play">${morph}</button>
		<button class="glass round skip" data-action="forward" part="skip-forward-button" aria-label="Forward 10 seconds" tabindex="-1">${icons.forward}</button>
	</div>
	<div class="spinner" part="spinner" role="status" aria-label="Loading"><span></span></div>
	<div class="dock" part="controls">
		<div class="timeline glass" part="timeline">
			<span class="current" part="time current-time" aria-hidden="true">0:00</span>
			<span class="chapter-now" part="current-chapter" aria-hidden="true"></span>
			<div class="scrubber slider" part="scrubber" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0 seconds">
			<div class="track" part="track"><div class="fill buffered"></div><div class="fill progress" part="progress"></div></div>
			<div class="rail marker-rail" aria-hidden="true"><div class="marker"></div></div>
			<div class="rail thumb-rail"><div class="thumb" part="thumb"></div></div>
			<div class="rail bubble-rail" aria-hidden="true"><div class="bubble glass" part="preview"><div class="shot" part="preview-image"></div><span class="bubble-label"><span class="bubble-chapter"></span><span class="bubble-time">0:00</span></span></div></div>
			</div>
			<button class="duration" part="time duration" aria-label="Show time remaining">0:00</button>
			<button class="live glass" part="live-badge" aria-label="Go to live"><span class="dot"></span><span class="live-label">Live</span></button>
		</div>
		<div class="row">
			<div class="cap glass" part="capsule">
				<button class="btn prev" part="previous-button" aria-label="Previous video" hidden>${icons.previous}</button>
				<button class="btn play" part="play-button" aria-label="Play">${morph}</button>
				<button class="btn next" part="next-button" aria-label="Next video" hidden>${icons.nextItem}</button>
			</div>
			<div class="cap glass volume" part="capsule volume">
				<button class="btn mute" part="mute-button" aria-label="Mute"><span class="i-high">${icons.volumeHigh}</span><span class="i-low">${icons.volumeLow}</span><span class="i-off">${icons.volumeOff}</span></button>
				<div class="volume-pop"><div class="slider volume-slider" part="volume-slider" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><div class="track"><div class="fill progress"></div></div><div class="rail thumb-rail"><div class="thumb"></div></div></div></div>
			</div>
			<button class="live live-row glass" part="live-badge" aria-label="Go to live"><span class="dot"></span><span class="live-label">Live</span></button>
			<span class="spacer"></span>
			<div class="cap glass group" part="capsule">
				<button class="btn toc" part="chapters-button" aria-label="Chapters" aria-haspopup="dialog" aria-expanded="false" aria-controls="chapters" hidden>${icons.chapters}</button>
				<button class="btn list" part="playlist-button" aria-label="Up next" aria-haspopup="dialog" aria-expanded="false" aria-controls="upnext" hidden>${icons.playlist}</button>
				<button class="btn cc" part="captions-button" aria-label="Captions" aria-pressed="false">${icons.captions}</button>
				<button class="btn gear" part="settings-button" aria-label="Settings" aria-haspopup="menu" aria-expanded="false" aria-controls="settings">${icons.settings}</button>
				<button class="btn pip" part="pip-button" aria-label="Picture in picture">${icons.pip}</button>
				<button class="btn fs" part="fullscreen-button" aria-label="Full screen"><span class="i-enter">${icons.fullscreen}</span><span class="i-exit">${icons.exitFullscreen}</span></button>
			</div>
		</div>
	</div>
	<div class="sheet glass" id="settings" part="settings" aria-label="Settings" inert><div class="pages"></div></div>
	<div class="menu glass" part="context-menu" role="menu" aria-label="Player menu" inert></div>
	<div class="panel glass stats" part="stats" role="dialog" aria-label="Stats for nerds" inert>
		<div class="panel-head"><span>Stats for nerds</span><button class="panel-close" aria-label="Close stats">${icons.close}</button></div>
		<dl class="stats-list"></dl>
	</div>
	<div class="panel glass keys" part="shortcuts" role="dialog" aria-label="Keyboard shortcuts" inert>
		<div class="panel-head"><span>Keyboard shortcuts</span><button class="panel-close" aria-label="Close shortcuts">${icons.close}</button></div>
		<dl class="keys-list"></dl>
	</div>
	<div class="panel glass upnext" id="upnext" part="playlist" role="dialog" aria-label="Up next" inert>
		<div class="panel-head"><span>Up next</span><button class="panel-close" aria-label="Close up next">${icons.close}</button></div>
		<ol class="upnext-list"></ol>
	</div>
	<div class="panel glass chapters" id="chapters" part="chapters" role="dialog" aria-label="Chapters" inert>
		<div class="panel-head"><span>Chapters</span><button class="panel-close" aria-label="Close chapters">${icons.close}</button></div>
		<ol class="chapter-list"></ol>
	</div>
	<div class="next-card glass" part="next-card" role="status" inert>
		<p class="next-label">Up next <span class="next-count"></span></p>
		<p class="next-title"></p>
		<div class="next-actions"><button class="next-play">Play now</button><button class="next-cancel">Cancel</button></div>
	</div>
	<div class="toast glass" part="toast" aria-hidden="true"></div>
	<div class="error" part="error" role="alert" inert>
		<div class="card glass">
			<span class="error-icon">${icons.alert}</span>
			<p class="error-title"></p>
			<p class="error-message"></p>
			<button class="retry glass" part="retry-button">${icons.retry}<span>Try again</span></button>
		</div>
	</div>
	<div class="sr" aria-live="polite"></div>
</div>`;
