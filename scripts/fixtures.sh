#!/usr/bin/env bash
# Makes the small local streams the end-to-end tests play: a three-rendition HLS stream, an MP4
# and a WebVTT file, cut from Big Buck Bunny (© Blender Foundation, CC BY 3.0). Needs ffmpeg and
# the network once; the output is committed, so tests never need the network.
set -euo pipefail

out="$(dirname "$0")/../test/fixtures"
rm -rf "$out" && mkdir -p "$out/hls"
bbb="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
# Program 0 of that stream is the 720p rendition with its audio.
ffmpeg -loglevel error -ss 96 -t 12 -i "$bbb" -map 0:1 -map 0:0 -c copy "$tmp/source.mp4"
ffmpeg -loglevel error -ss 30 -t 6 -i "$bbb" -map 0:1 -map 0:0 -c copy "$tmp/short.mp4"
src=(-i "$tmp/source.mp4")

ffmpeg -loglevel error "${src[@]}" \
  -filter_complex "[0:v]split=3[a][b][c];[a]scale=640:360[v0];[b]scale=960:540[v1];[c]copy[v2]" \
  -map "[v0]" -map "[v1]" -map "[v2]" -map 0:a -map 0:a -map 0:a \
  -c:v libx264 -profile:v main -preset veryfast -g 60 -keyint_min 60 -sc_threshold 0 \
  -b:v:0 90k -b:v:1 150k -b:v:2 220k -c:a aac -b:a 32k -ac 2 \
  -f hls -hls_time 2 -hls_playlist_type vod -hls_segment_type fmp4 -hls_fmp4_init_filename "init.mp4" -hls_segment_filename "$out/hls/v%v_%03d.m4s" \
  -master_pl_name main.m3u8 -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" "$out/hls/v%v.m3u8"

ffmpeg -loglevel error -i "$tmp/short.mp4" -vf scale=640:360 \
  -c:v libx264 -preset veryfast -b:v 150k -c:a aac -b:a 32k -movflags +faststart "$out/clip.mp4"

cat > "$out/captions.vtt" <<'VTT'
WEBVTT

00:00:00.000 --> 00:00:06.000
Captions are on.

00:00:06.000 --> 00:00:12.000
Still here, six seconds in.
VTT

du -sh "$out"
