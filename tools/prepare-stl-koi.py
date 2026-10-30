"""Optimize the user-supplied ornamental STL sculpture for the Three.js intro.

Run with Blender 5.x: blender -b --python tools/prepare-stl-koi.py
The editable optimized sculptures are saved as .blend alongside exported .glb files.
"""

from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "models"
OUT.mkdir(parents=True, exist_ok=True)

SOURCES = [
    (Path.home() / "Downloads" / "Koi_Fish.stl", "koi-ornamental", 62000, "Antique gold"),
]


def material(name, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    attr = mat.node_tree.nodes.new("ShaderNodeAttribute")
    attr.attribute_name = "SculptureColor"
    mat.node_tree.links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def paint(obj):
    mesh = obj.data
    colors = mesh.color_attributes.new(name="SculptureColor", type="FLOAT_COLOR", domain="CORNER")
    for polygon in mesh.polygons:
        polygon.use_smooth = True
        for loop_index in polygon.loop_indices:
            p = mesh.vertices[mesh.loops[loop_index].vertex_index].co
            # A restrained gradient lets the raised scales catch the key light.
            patina = min(1, max(0, (p.z+.15)/.70))
            bronze = (.19, .115, .055)
            gold = (.65, .43, .20)
            color = tuple(a*(1-patina)+b*patina for a,b in zip(bronze, gold))
            colors.data[loop_index].color = (*color, 1)


for source, slug, target_faces, material_name in SOURCES:
    if not source.exists():
        raise FileNotFoundError(f"Missing user-provided source: {source}")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.wm.stl_import(filepath=str(source))
    obj = bpy.context.object
    obj.name = slug

    # Preserve the original sculpt and detail while making real-time rendering practical.
    decimate = obj.modifiers.new("Web triangle budget", "DECIMATE")
    decimate.ratio = min(1, target_faces / len(obj.data.polygons))
    bpy.ops.object.modifier_apply(modifier=decimate.name)

    mesh = obj.data
    low = Vector(tuple(min(v.co[i] for v in mesh.vertices) for i in range(3)))
    high = Vector(tuple(max(v.co[i] for v in mesh.vertices) for i in range(3)))
    center = (low + high) / 2
    scale = 2.85 / max(high[i]-low[i] for i in range(3))
    for vertex in mesh.vertices:
        vertex.co = (vertex.co - center) * scale
    mesh.update()

    paint(obj)
    obj.data.materials.clear()
    obj.data.materials.append(material(material_name, .76, .30))
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "assets" / f"{slug}.blend"))
    bpy.ops.export_scene.gltf(filepath=str(OUT / f"{slug}.glb"), export_format="GLB", use_selection=True, export_apply=True)
    print("EXPORTED", slug, "triangles", len(mesh.polygons))
