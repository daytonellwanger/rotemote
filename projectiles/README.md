# Projectiles

A simple example of using physics to create images.

![Example](example.gif)

![Example](example.png)

Creates a series of images in the `images` folder (make sure to create this before running!) of projectiles being fired.

These images can be stitched into a video with ffmpeg, like this:

```
ffmpeg -framerate 64 -i i_%d.png -c:v libx264 -pix_fmt yuv420p output.mp4
```
