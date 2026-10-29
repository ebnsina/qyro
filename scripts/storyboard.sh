#!/usr/bin/env bash
# Makes a WebVTT storyboard (one sprite JPEG plus a VTT of #xywh tiles) for any video ffmpeg reads.
# Usage: scripts/storyboard.sh <video or stream URL> <output dir> [seconds per tile]
set -euo pipefail

src="$1"
out="$2"
every="${3:-5}"
w=160 h=90 cols=10
mkdir -p "$out"

duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")"
count="$(awk -v d="$duration" -v e="$every" 'BEGIN { n = int(d / e); if (n * e < d) n++; print n }')"
rows=$(((count + cols - 1) / cols))

ffmpeg -loglevel error -y -i "$src" -vf "fps=1/$every,scale=$w:$h,tile=${cols}x${rows}" -frames:v 1 -q:v 6 "$out/storyboard.jpg"

stamp() { awk -v s="$1" 'BEGIN { printf "%02d:%02d:%06.3f", int(s / 3600), int(s % 3600 / 60), s - int(s / 60) * 60 }'; }
{
	echo "WEBVTT"
	for ((i = 0; i < count; i++)); do
		start=$((i * every))
		end=$(((i + 1) * every))
		echo
		echo "$(stamp $start) --> $(stamp $end)"
		echo "storyboard.jpg#xywh=$((i % cols * w)),$((i / cols * h)),$w,$h"
	done
} >"$out/storyboard.vtt"
echo "$count tiles, $(du -h "$out/storyboard.jpg" | cut -f1)"
