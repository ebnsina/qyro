import PlayIcon from '@hugeicons/core-free-icons/PlayIcon';
import PauseIcon from '@hugeicons/core-free-icons/PauseIcon';
import VolumeHighIcon from '@hugeicons/core-free-icons/VolumeHighIcon';
import VolumeLowIcon from '@hugeicons/core-free-icons/VolumeLowIcon';
import VolumeOffIcon from '@hugeicons/core-free-icons/VolumeOffIcon';
import Settings02Icon from '@hugeicons/core-free-icons/Settings02Icon';
import FullScreenIcon from '@hugeicons/core-free-icons/FullScreenIcon';
import MinimizeScreenIcon from '@hugeicons/core-free-icons/MinimizeScreenIcon';
import PictureInPictureOnIcon from '@hugeicons/core-free-icons/PictureInPictureOnIcon';
import ClosedCaptionIcon from '@hugeicons/core-free-icons/ClosedCaptionIcon';
import GoForward10SecIcon from '@hugeicons/core-free-icons/GoForward10SecIcon';
import GoBackward10SecIcon from '@hugeicons/core-free-icons/GoBackward10SecIcon';
import Refresh01Icon from '@hugeicons/core-free-icons/Refresh01Icon';
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Tick02Icon from '@hugeicons/core-free-icons/Tick02Icon';
import Copy01Icon from '@hugeicons/core-free-icons/Copy01Icon';
import Link01Icon from '@hugeicons/core-free-icons/Link01Icon';
import RepeatIcon from '@hugeicons/core-free-icons/RepeatIcon';
import KeyboardIcon from '@hugeicons/core-free-icons/KeyboardIcon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Activity01Icon from '@hugeicons/core-free-icons/Activity01Icon';
import RefreshCcwIcon from '@hugeicons/core-free-icons/RefreshCcwIcon';
import PlayListIcon from '@hugeicons/core-free-icons/PlayListIcon';
import PreviousIcon from '@hugeicons/core-free-icons/PreviousIcon';
import NextIcon from '@hugeicons/core-free-icons/NextIcon';

type IconNode = readonly (readonly [string, Record<string, string | number>])[];

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

/** Renders a Hugeicons node list as an inline SVG string. `filled` paints the shape, for play and pause. */
function svg(node: IconNode, filled = false): string {
	const body = node
		.map(([tag, attrs]) => {
			const a = Object.entries(attrs)
				.filter(([k]) => k != 'key')
				.map(([k, v]) => `${kebab(k)}="${v}"`)
				.join(' ');
			return `<${tag} ${a}${filled ? ' fill="currentColor"' : ''}/>`;
		})
		.join('');
	return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false">${body}</svg>`;
}

export const icons = {
	play: svg(PlayIcon as IconNode, true),
	pause: svg(PauseIcon as IconNode, true),
	volumeHigh: svg(VolumeHighIcon as IconNode),
	volumeLow: svg(VolumeLowIcon as IconNode),
	volumeOff: svg(VolumeOffIcon as IconNode),
	settings: svg(Settings02Icon as IconNode),
	fullscreen: svg(FullScreenIcon as IconNode),
	exitFullscreen: svg(MinimizeScreenIcon as IconNode),
	pip: svg(PictureInPictureOnIcon as IconNode),
	captions: svg(ClosedCaptionIcon as IconNode),
	forward: svg(GoForward10SecIcon as IconNode),
	backward: svg(GoBackward10SecIcon as IconNode),
	retry: svg(Refresh01Icon as IconNode),
	alert: svg(Alert02Icon as IconNode),
	back: svg(ArrowLeft01Icon as IconNode),
	next: svg(ArrowRight01Icon as IconNode),
	check: svg(Tick02Icon as IconNode),
	copy: svg(Copy01Icon as IconNode),
	link: svg(Link01Icon as IconNode),
	loop: svg(RepeatIcon as IconNode),
	keyboard: svg(KeyboardIcon as IconNode),
	close: svg(Cancel01Icon as IconNode),
	stats: svg(Activity01Icon as IconNode),
	replay: svg(RefreshCcwIcon as IconNode),
	playlist: svg(PlayListIcon as IconNode),
	previous: svg(PreviousIcon as IconNode, true),
	nextItem: svg(NextIcon as IconNode, true),
};
