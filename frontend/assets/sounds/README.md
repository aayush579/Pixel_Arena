# Sound Effects Guide

## Sound Files Needed

Place your sound files in the `assets/sounds/` directory with these names:

### UI Sounds
- `click.mp3` - Button click sound
- `hover.mp3` - Button hover sound (optional)
- `success.mp3` - Success notification
- `error.mp3` - Error notification

### Game Sounds
- `kick.mp3` - Kick attack sound
- `hit.mp3` - Hit/punch attack sound
- `jump.mp3` - Jump sound (future use)
- `land.mp3` - Landing sound (future use)
- `damage.mp3` - Taking damage sound
- `victory.mp3` - Win sound
- `defeat.mp3` - Lose sound

### Background Music
- `menu-music.mp3` - Menu/lobby background music
- `battle-music.mp3` - Battle arena background music

## Fallback System

If you don't have sound files yet, the system will use a **beep generator** that creates simple electronic sounds using the Web Audio API. This works out of the box with no files needed!

## Free Sound Resources

You can get free sound effects from:
- **Freesound.org** - https://freesound.org/
- **OpenGameArt.org** - https://opengameart.org/
- **Zapsplat** - https://www.zapsplat.com/
- **Mixkit** - https://mixkit.co/free-sound-effects/

## Recommended Sound Specs

- **Format**: MP3 or OGG
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128kbps or higher
- **Length**: 
  - UI sounds: 0.1-0.3 seconds
  - Game sounds: 0.2-0.5 seconds
  - Music: 1-3 minutes (looping)

## Sound Controls

Users can:
- Toggle sound on/off
- Adjust volume
- Settings are saved in localStorage

## Current Status

✅ Sound system implemented
✅ Beep generator fallback active
⏳ Waiting for actual sound files (optional)

The game will work perfectly with the beep generator until you add real sound files!
