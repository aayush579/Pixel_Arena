# Arena Background Customization Guide

## How to Change the Arena Background

The arena background can be easily customized by editing the `canvas` styles in [css/game.css](file:///c:/Users/Aayush/Desktop/work/programming%20lang/sigmawebdv/PIXEL_ARENA/css/game.css).

---

## Available Background Options

### OPTION 1: Solid Dark (Original)
Simple solid dark background
```css
background: #1b1b1b;
```

### OPTION 2: Cyberpunk Gradient (Currently Active) ✅
Dark gradient with blue/purple tones
```css
background: linear-gradient(135deg, #0a0a1a 0%, #1a0a1a 50%, #0a1a1a 100%);
```

### OPTION 3: Neon Grid Pattern
Cyberpunk-style grid overlay
```css
background: 
  linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
  #0e0e0e;
background-size: 50px 50px;
```

### OPTION 4: Purple/Blue Gradient
Deep purple to blue gradient
```css
background: linear-gradient(180deg, #1a0033 0%, #000033 100%);
```

### OPTION 5: Red/Orange Arena
Fiery red arena theme
```css
background: linear-gradient(135deg, #2a0a0a 0%, #1a0505 100%);
```

### OPTION 6: Green Matrix Style
Matrix-inspired green theme
```css
background: linear-gradient(135deg, #0a1a0a 0%, #051a05 100%);
```

### OPTION 7: Animated Gradient
Slowly shifting gradient colors
```css
background: linear-gradient(-45deg, #0a0a1a, #1a0a1a, #0a1a1a, #1a1a0a);
background-size: 400% 400%;
animation: gradientShift 15s ease infinite;
```

### OPTION 8: Background Image
Use your own background image
```css
background-image: url('../assets/ui/arena-bg.png');
background-size: cover;
background-position: center;
background-repeat: no-repeat;
```

### OPTION 9: Parallax Layers
Multiple layered backgrounds for depth
```css
background: 
  linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
  url('../assets/ui/arena-layer2.png'),
  url('../assets/ui/arena-layer1.png'),
  #0a0a1a;
background-size: cover, 150% auto, 100% auto;
background-position: center;
```

---

## How to Switch Backgrounds

1. Open [css/game.css](file:///c:/Users/Aayush/Desktop/work/programming%20lang/sigmawebdv/PIXEL_ARENA/css/game.css)
2. Find the `canvas` section (around line 13)
3. Comment out the current background (add `/*` before and `*/` after)
4. Uncomment your desired option (remove `/*` and `*/`)
5. Save and refresh your browser

**Example:**
```css
canvas {
  /* OPTION 2: Cyberpunk Gradient */
  /* background: linear-gradient(135deg, #0a0a1a 0%, #1a0a1a 50%, #0a1a1a 100%); */
  
  /* OPTION 3: Neon Grid Pattern */
  background: 
    linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    #0e0e0e;
  background-size: 50px 50px;
  
  /* ... other styles ... */
}
```

---

## Custom Colors

You can create your own custom gradient by modifying the color codes:

```css
/* Custom gradient example */
background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
```

**Color suggestions:**
- **Blue theme**: `#001a33` to `#000d1a`
- **Purple theme**: `#1a0033` to `#0d001a`
- **Orange theme**: `#331a00` to `#1a0d00`
- **Teal theme**: `#00331a` to `#001a0d`

---

## Adding Background Images

To use a background image:

1. Place your image in `assets/ui/` folder
2. Name it something like `arena-bg.png`
3. Use OPTION 8 or 9 in the CSS
4. Adjust `background-size` and `background-position` as needed

**Recommended image specs:**
- Size: 800x400 pixels (matches canvas size)
- Format: PNG or JPG
- Style: Dark/muted colors work best
- Tip: Use semi-transparent overlays for better character visibility

---

## Tips for Best Results

1. **Keep it dark**: Lighter backgrounds make characters hard to see
2. **Low contrast**: Subtle patterns work better than busy designs
3. **Test visibility**: Make sure player sprites stand out
4. **Performance**: Simple gradients perform better than complex images
5. **Theme matching**: Match the background to your game's overall aesthetic

---

## Current Setting

✅ **Currently Active**: OPTION 2 - Cyberpunk Gradient

This provides a nice dark blue/purple gradient that matches the cyberpunk theme of the UI!
