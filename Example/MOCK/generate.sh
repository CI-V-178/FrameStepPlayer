#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -hide_banner -loglevel error -y -f lavfi -i testsrc2=size=640x360:rate=60 -t 10 -vf "drawtext=text='%{frame_num}':fontsize=64:fontcolor=white:x=20:y=20" -c:v libx264 -crf 10 -pix_fmt yuv420p -g 30 -movflags +faststart f60.mp4
ffmpeg -hide_banner -loglevel error -y -f lavfi -i testsrc2=size=640x360:rate=30 -t 5 -c:v libx264 -pix_fmt yuv420p f30.mp4
ffmpeg -hide_banner -loglevel error -y -i f60.mp4 -c copy f60_moov_end.mp4
