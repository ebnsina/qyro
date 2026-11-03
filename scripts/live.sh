#!/usr/bin/env bash
# A live stream for the end-to-end tests: the clip looped in real time, with a sliding window of
# `segments` two-second segments. Usage: scripts/live.sh <name> <segments>, e.g. live 150 (5 minutes).
# Output: test/generated/<name> (gitignored); the Playwright web servers start and stop these.
set -euo pipefail

name="$1"
segments="$2"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/test/generated/$name"
rm -rf "$out" && mkdir -p "$out"
exec ffmpeg -loglevel error -re -stream_loop -1 -i "$root/test/fixtures/clip.mp4" \
  -c copy -f hls -hls_time 2 -hls_list_size "$segments" -hls_flags delete_segments+omit_endlist \
  -hls_segment_type fmp4 -hls_fmp4_init_filename init.mp4 -hls_segment_filename "$out/seg%05d.m4s" "$out/index.m3u8"
