# Gradients

How to create linear gradients.

Can be used to create skies/sunsets, like this:

![Sunset](sunset.png)

```
const stops: { p: number; color: RGB }[] = [
    { p: 0.0, color: { r: 15, g: 25, b: 60 } },
    { p: 0.25, color: { r: 40, g: 70, b: 140 } },
    { p: 0.45, color: { r: 90, g: 160, b: 200 } },
    { p: 0.6, color: { r: 255, g: 220, b: 150 } },
    { p: 0.75, color: { r: 255, g: 140, b: 60 } },
    { p: 0.9, color: { r: 220, g: 70, b: 40 } },
    { p: 1.0, color: { r: 120, g: 30, b: 60 } },
];
```

Or beaches:

![Beach](beach.png)

```
const stops: { p: number; color: RGB }[] = [
    { p: 0.0, color: { r: 229, g: 198, b: 167 } },
    { p: 0.4, color: { r: 236, g: 198, b: 153 } },
    { p: 0.5, color: { r: 200, g: 200, b: 200 } },
    { p: 0.7, color: { r: 120, g: 178, b: 181 } },
    { p: 1.0, color: { r: 3, g: 149, b: 149 } },
];
```
