"""Paint four distinct editions of the user's ornamental koi sculpture.

Run with Blender 5.x after prepare-stl-koi.py. The saved blend is an editable
gallery; each exported GLB is centered at its own origin for the web scene.
"""

from pathlib import Path
import math

import bpy


ROOT = Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT / "assets" / "koi-ornamental.blend"))
base = bpy.data.objects["koi-ornamental"]
OUT = ROOT / "public" / "models"
OUT.mkdir(parents=True, exist_ok=True)

EDITIONS = [
    ("oro", "Aureo / antique gold", .76, .30),
    ("kohaku", "Kohaku / vermilion porcelain", .22, .34),
    ("sumi", "Sumi / obsidian and copper", .58, .27),
    ("jade", "Jade / celadon and brass", .44, .31),
]


def clamp(value):
    return max(0.0, min(1.0, value))


def mix(a, b, amount):
    amount = clamp(amount)
    return tuple(a[i] * (1-amount) + b[i] * amount for i in range(3))


def smooth(low, high, value):
    amount = clamp((value-low) / (high-low))
    return amount * amount * (3-2*amount)


def paint(x, y, z, edition):
    if edition == "oro":
        height = smooth(-.15, .55, z)
        return mix((.18, .11, .055), (.70, .48, .23), height)

    if edition == "kohaku":
        porcelain = (.86, .82, .72)
        red = (.73, .028, .018)
        spots = [(-.64, -.08, .31, .25), (.08, .10, .39, .25), (.69, -.05, .25, .19)]
        intensity = 0
        for cx, cy, rx, ry in spots:
            edge = ((x-cx)/rx)**2 + ((y-cy)/ry)**2
            edge += .18 * math.sin(19*x + 9*y) + .13 * math.sin(26*y - 8*x)
            intensity = max(intensity, 1-smooth(.55, 1.3, edge))
        color = mix(porcelain, red, intensity * smooth(-.23, .08, z))
        return mix(color, (.75, .47, .20), .25 * smooth(.42, .67, z))

    if edition == "sumi":
        ink = (.027, .045, .052)
        copper = (.80, .35, .13)
        wave = .13*math.sin(x*6.3) + .04*math.sin(x*15.0)
        band = 1-smooth(.035, .19, abs(y-wave))
        secondary = 1-smooth(.03, .12, abs(y+.27+.055*math.sin(x*8)))
        color = mix(ink, copper, max(band, secondary*.5) * smooth(-.15, .17, z))
        return mix(color, (.46, .27, .11), .4 * smooth(.50, .68, z))

    jade = (.045, .25, .20)
    celadon = (.52, .73, .62)
    brass = (.79, .57, .25)
    wave = math.sin(x*11.5 + y*5.0 + 1.4*math.sin(x*3.5))
    color = mix(jade, celadon, smooth(.30, .88, wave) * smooth(-.17, .15, z) * .78)
    return mix(color, brass, .55 * smooth(.43, .67, z))


for index, (slug, name, metal, roughness) in enumerate(EDITIONS):
    obj = base.copy()
    obj.data = base.data.copy()
    obj.name = f"Ornamental koi / {slug}"
    bpy.context.collection.objects.link(obj)
    mesh = obj.data
    old = mesh.color_attributes.get("SculptureColor")
    if old:
        mesh.color_attributes.remove(old)
    colors = mesh.color_attributes.new(name="SculptureColor", type="FLOAT_COLOR", domain="CORNER")
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index]
            colors.data[loop_index].color = (*paint(*vertex.co, slug), 1)

    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = roughness
    attribute = material.node_tree.nodes.new("ShaderNodeAttribute")
    attribute.attribute_name = "SculptureColor"
    material.node_tree.links.new(attribute.outputs["Color"], bsdf.inputs["Base Color"])
    mesh.materials.clear()
    mesh.materials.append(material)

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(filepath=str(OUT / f"ornamental-{slug}.glb"), export_format="GLB", use_selection=True, export_apply=True)
    obj.location.x = (index - 1.5) * 3.6
    print("EXPORTED", slug, len(mesh.polygons), "triangles")

bpy.data.objects.remove(base, do_unlink=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "assets" / "ornamental-school.blend"))
