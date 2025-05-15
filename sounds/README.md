# Music Files Directory

This directory is used to store music files that will be played randomly when clicking the music icon on the portfolio page.

## Adding Music Files

1. Add your MP3 files to this directory
2. Music files should be in MP3 format for maximum compatibility
3. Recommended file size is less than 5MB per track for optimal page performance
4. Update the list of tracks in `js/music-player.js` if you add files with different names than the defaults

## Default Track Names

The music player is configured to look for the following default tracks:
- track1.mp3
- track2.mp3
- track3.mp3
- background-music.mp3
- portfolio-theme.mp3

If you use these filenames, the player will automatically detect and use them without requiring any code changes.

## Usage

The music player will randomly select from available tracks each time the music icon is clicked or when a track finishes playing. 