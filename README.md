# 🥑 3D OBJ Viewer Show

Browser 3D viewer for **OBJ** models: orbit camera, materials, annotations, and a simple slide show.

**by [aoxilus](https://github.com/aoxilus)**

Drop `.obj` files on a PHP host, open the page, pick a model, park the camera, add arrows, save slides.

## What it is

| Piece | Role |
|-------|------|
| `index.html` + `loader.js` | Main viewer: load OBJ, materials, store slides |
| `loadModel.js` | Alternate loader with marker + axes |
| `annotations.js` | Click two points to draw 3D arrows |
| `textures.js` | Plain / wireframe / sky-blue metallic looks |
| `marker.js` / `axesIndicator.js` | Marker sphere and XYZ arrows on the model |
| `cameraControls.js` | OrbitControls helper (Z-up option) |
| `object_files/` | Put `.obj` models here |
| `list_files.php` | JSON list of `.obj` files in that folder |
| `save_slide.php` | Append a slide (camera + marker + note) to `slides.json` |
| `viewer/` | Playback: walks through saved slides |

Needs a **PHP** server (Apache, `php -S`, etc.). Three.js loads from jsDelivr (r119).

## Quick start

```powershell
php -S 127.0.0.1:8080
```

Open http://127.0.0.1:8080/

1. Copy `.obj` files into `object_files/`
2. Refresh and pick a file
3. Orbit the camera, toggle materials, optionally **Toggle Annotations**
4. Name the view and **Store Slide**
5. Open `viewer/` to play the slideshow

`save_slide.php` writes `slides.json` with **no login**. Use it on a machine you trust, not on a random public host.

## License / Licencia

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — Attribution-NonCommercial-ShareAlike. See [LICENSE](LICENSE).

Made with 🥑 by [aoxilus](https://github.com/aoxilus)
