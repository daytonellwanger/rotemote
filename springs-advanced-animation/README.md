# Springs - Advanced Animation

A more advanced animation built upon the work in `springs`

Creates a series of images in the `images` folder (make sure to create this before running!) of multiple springs.

These images can be stitched into a video with ffmpeg, like this:

```
ffmpeg -framerate 24 -i spring_%d.png -c:v libx264 -pix_fmt yuv420p output.mp4
```

![Example](example.gif)
