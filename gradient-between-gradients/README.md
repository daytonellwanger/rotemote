# Gradient Between Gradients

Creates an animation by doing a linear interpolation between linear interpolations.

![Example](example.gif)

Creates a series of images in the `images` folder (make sure to create this before running!)

These images can be stitched into a video with ffmpeg, like this:

```
ffmpeg -framerate 24 -i gradient_%d.png -c:v libx264 -pix_fmt yuv420p output.mp4
```