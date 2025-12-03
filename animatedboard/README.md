# Animated Board

Creates a series of images in the `images` folder (make sure to create this before running!) of a checkered board being constructed.

These images can be stitched into a video with ffmpeg, like this:

```
ffmpeg -framerate 64 -i board_%d.png -c:v libx264 -pix_fmt yuv420p output.mp4
```
