"""Create the original Mario Koi sculptures. Run with Blender 5.x in background mode."""

from pathlib import Path
import math

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/models"
OUT.mkdir(parents=True, exist_ok=True)

STATIONS = [
    (-1.00, .038, .045, .020),
    (-.82, .070, .075, .025),
    (-.58, .150, .135, .012),
    (-.27, .230, .190, .000),
    (.08, .275, .230, .000),
    (.39, .255, .205, .015),
    (.65, .200, .155, .025),
    (.84, .115, .095, .025),
    (1.00, .085, .075, .012),
    (1.055, .015, .025, .012),
]


def interpolate(x, field):
    for index in range(len(STATIONS) - 1):
        if x <= STATIONS[index + 1][0]:
            a = STATIONS[max(0, index - 1)][field]
            b = STATIONS[index][field]
            c = STATIONS[index + 1][field]
            d = STATIONS[min(len(STATIONS) - 1, index + 2)][field]
            t = (x - STATIONS[index][0]) / (STATIONS[index + 1][0] - STATIONS[index][0])
            return max(.001, .5 * ((2*b) + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t))
    return STATIONS[-1][field]


def blend(a, b, t):
    t = max(0, min(1, t))
    return tuple(a[i] * (1-t) + b[i] * t for i in range(3))


def smooth(low, high, value):
    t = max(0, min(1, (value-low)/(high-low)))
    return t*t*(3-2*t)


def pigment(x, y, z, kind):
    base, ink = (.86, .82, .72), (.64, .018, .012)
    spots = [(.68, .015, .24, .19), (.13, -.08, .30, .23), (-.48, .08, .28, .20)]
    strength = 0
    for cx, cy, rx, ry in spots:
        boundary = ((x-cx)/rx)**2 + ((y-cy)/ry)**2
        boundary += .22*math.sin(17*x + 11*y) + .12*math.sin(29*x - 13*y)
        strength = max(strength, 1-smooth(.55, 1.35, boundary))
    strength *= smooth(-.05, .08, z)
    color = blend(base, ink, strength)
    glint = .025 * (1 + math.sin(x*43 + y*32)) * smooth(.02, .22, z)
    return tuple(min(1, c + glint) for c in color)


def make_material(name, color, metallic=.0, roughness=.5, vertex=False):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (*color, 1)
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if vertex:
        attr = material.node_tree.nodes.new("ShaderNodeAttribute")
        attr.attribute_name = "Pigment"
        material.node_tree.links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
    return material


def create_body(kind, material):
    segments, sides = 128, 48
    vertices, faces = [], []
    for i in range(segments + 1):
        x = -1 + 2.055*i/segments
        width, height, center = [interpolate(x, field) for field in (1, 2, 3)]
        for j in range(sides):
            angle = 2*math.pi*j/sides
            vertices.append((x, width*math.cos(angle), center + height*math.sin(angle)))
    for i in range(segments):
        for j in range(sides):
            a = i*sides+j
            b = i*sides+(j+1)%sides
            faces.append((a, b, b+sides, a+sides))
    faces.extend([tuple(reversed(range(sides))), tuple(segments*sides+j for j in range(sides))])
    mesh = bpy.data.meshes.new("Koi body / sculpted surface")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    color_attr = mesh.color_attributes.new(name="Pigment", type="FLOAT_COLOR", domain="CORNER")
    for polygon in mesh.polygons:
        polygon.use_smooth = True
        for loop_index in polygon.loop_indices:
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index]
            color_attr.data[loop_index].color = (*pigment(*vertex.co, kind), 1)
    obj = bpy.data.objects.new("01 / hand-painted body", mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(material)
    return obj


def paint_fin(mesh, width_steps, base, tip):
    attribute = mesh.color_attributes.new(name="Pigment", type="FLOAT_COLOR", domain="CORNER")
    length_steps = len(mesh.vertices) // (width_steps + 1) - 1
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex_index = mesh.loops[loop_index].vertex_index
            u = (vertex_index // (width_steps + 1)) / length_steps
            v = 2 * (vertex_index % (width_steps + 1)) / width_steps - 1
            color = blend(base, tip, smooth(.05, 1, u))
            rib = .91 + .09 * math.cos(v * math.pi * 6)
            edge = 1 - .18 * smooth(.76, 1, abs(v))
            attribute.data[loop_index].color = (*(channel * rib * edge for channel in color), 1)


def create_fin(name, start, tip, half_width, mat, palette, bend=.035, fan=False):
    start, tip = Vector(start), Vector(tip)
    along = tip - start
    perpendicular = Vector((-along.y, along.x, 0)).normalized()
    vertices, faces = [], []
    length_steps, width_steps = 18, 10
    for i in range(length_steps + 1):
        u = i/length_steps
        middle = start.lerp(tip, u)
        radius = half_width * (math.sin(math.pi*u/2)**.8 if fan else math.sin(math.pi*u)**.7)
        for j in range(width_steps + 1):
            v = 2*j/width_steps-1
            point = middle + perpendicular * radius * v
            point.z += bend * math.sin(math.pi*u) * (1-v*v)
            vertices.append(point)
    for i in range(length_steps):
        for j in range(width_steps):
            a = i*(width_steps+1)+j
            faces.append((a, a+1, a+width_steps+2, a+width_steps+1))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    paint_fin(mesh, width_steps, *palette)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def create_tail(mat, palette):
    vertices, faces = [], []
    length_steps, width_steps = 22, 24
    for i in range(length_steps + 1):
        u = i/length_steps
        for j in range(width_steps + 1):
            v = 2*j/width_steps-1
            x = -1.0 - .55*u + .16*u*(1-v*v)
            y = .43*u*v
            z = .02 + .04*u*(1-v*v) + .015*math.sin(v*math.pi*2)*u
            vertices.append((x, y, z))
    for i in range(length_steps):
        for j in range(width_steps):
            a = i*(width_steps+1)+j
            faces.append((a, a+1, a+width_steps+2, a+width_steps+1))
    mesh = bpy.data.meshes.new("Flowing caudal fan")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    paint_fin(mesh, width_steps, *palette)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    mesh.materials.append(mat)
    obj = bpy.data.objects.new("04 / broad tail fan", mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def bead(name, location, size, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=size, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def filament(name, points, mat, radius=.003):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points)-1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return bpy.context.object


def on_porcelain(x, y, lift=.006):
    width = interpolate(x, 1)
    height = interpolate(x, 2)
    center = interpolate(x, 3)
    return (x, y, center + height * math.sqrt(max(.02, 1 - (y / width)**2)) + lift)


def kintsugi_lines(gold, shadow):
    # Individual asymmetrical repairs follow the changing curvature of the body.
    paths = [
        [(-.71, -.025), (-.55, .020), (-.35, -.035), (-.18, .015), (.02, -.08), (.23, -.035), (.43, -.09)],
        [(-.56, .015), (-.49, .09), (-.39, .12)],
        [(-.35, -.035), (-.39, -.105), (-.48, -.13)],
        [(-.18, .015), (-.10, .125), (.03, .16)],
        [(.02, -.08), (.07, -.16), (.18, -.17)],
        [(.23, -.035), (.34, .07), (.51, .11)],
        [(.43, -.09), (.56, -.13), (.69, -.08)],
    ]
    for index, path in enumerate(paths):
        filament(f"Repair shadow {index}", [on_porcelain(x, y, .004) for x, y in path], shadow, .009)
        filament(f"Kintsugi gold {index}", [on_porcelain(x, y, .011) for x, y in path], gold, .004)
        for x, y in path[1:-1:2]:
            bead("Gold pooled at fracture", on_porcelain(x, y, .014), .011, gold)


def clockwork_heart(gold, bronze, turquoise):
    # The exposed mechanism is an original jewel-like detail, built from simple
    # Blender solids and kept as a separate node for animation in Three.js.
    x, y, surface = on_porcelain(-.10, .0, .017)
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(x, y, surface))
    rotor = bpy.context.object
    rotor.name = "Clockwork rotor"
    components = []

    def cylinder(name, radius, depth, z, mat, vertices=40):
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=(x, y, z))
        obj = bpy.context.object
        obj.name = name
        obj.data.materials.append(mat)
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        components.append(obj)
        return obj

    cylinder("Bronze setting", .136, .014, surface, bronze)
    cylinder("Golden annular gear", .112, .019, surface + .016, gold, 48)
    cylinder("Recessed dark face", .090, .021, surface + .030, bronze)
    cylinder("Turquoise enamel heart", .071, .027, surface + .048, turquoise)
    cylinder("Central gold axle", .016, .031, surface + .075, gold)
    for index in range(16):
        angle = index * math.tau / 16
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x + .125*math.cos(angle), y + .125*math.sin(angle), surface + .018))
        tooth = bpy.context.object
        tooth.name = "Brass clock tooth"
        tooth.scale = (.037, .025, .015)
        tooth.rotation_euler.z = angle
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        tooth.data.materials.append(gold)
        components.append(tooth)
    for index in range(8):
        angle = index * math.tau / 8
        dot = bead("Gold inner dial", (x+.082*math.cos(angle), y+.082*math.sin(angle), surface+.054), .007, gold)
        components.append(dot)
    bpy.context.view_layer.update()
    for obj in components:
        world = obj.matrix_world.copy()
        obj.parent = rotor
        obj.matrix_world = world


def gilded_fins(gold):
    for side in (-1, 1):
        for spread in (-.55, 0, .55):
            filament("Pectoral gold vein", [
                (.25, side*.22, .052),
                (.02 + spread*.09, side*.44, .091),
                (-.19 + spread*.15, side*.68, .102),
            ], gold, .003)
        filament("Pelvic gold vein", [(-.43, side*.15, .010), (-.61, side*.27, .052), (-.78, side*.40, .049)], gold, .0025)
    for v in (-.75, -.38, 0, .38, .75):
        filament("Tail gold filament", [(-1.0, 0, .039), (-1.2, v*.23, .053), (-1.5, v*.43, .066)], gold, .0025)


def build(kind):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    fin_color = (.57, .11, .055)
    fin_tip = (.71, .43, .25)
    line_color = (.90, .64, .28)
    body_mat = make_material("Porcelain pigment / " + kind, (.8, .8, .8), .08, .36, vertex=True)
    fin_mat = make_material("Lacquered silk fins / " + kind, fin_color, .28, .38, vertex=True)
    line_mat = make_material("Gilded detail / " + kind, line_color, .84, .24)
    eye_mat = make_material("Obsidian eyes", (.007, .011, .012), .25, .18)
    bronze_mat = make_material("Dark clockwork bronze", (.11, .064, .034), .75, .32)
    turquoise_mat = make_material("Turquoise enamel", (.015, .40, .35), .32, .18)

    create_body(kind, body_mat)
    for side in (-1, 1):
        create_fin("02 / flowing pectoral", (.30, side*.21, .02), (-.24, side*.70, .09), .24, fin_mat, (fin_color, fin_tip), fan=True)
        create_fin("03 / pelvic fin", (-.42, side*.14, -.015), (-.80, side*.39, .035), .13, fin_mat, (fin_color, fin_tip), fan=True)
        bead("05 / gold eye mount", (.80, side*.112, .07), .032, line_mat)
        bead("06 / obsidian eye", (.816, side*.129, .08), .019, eye_mat)
        filament("07 / whisker", [(.97, side*.06, .00), (1.06, side*.12, -.025), (1.105, side*.16, -.065)], line_mat, .004)
        for n in range(2):
            x = .56 - n*.065
            filament("08 / gill engraving", [(x, side*.165, .10), (x-.025, side*.205, .035), (x-.04, side*.18, -.04)], line_mat, .002)
    create_tail(fin_mat, (fin_color, fin_tip))
    filament("10 / spine filigree", [(-.66, 0, .115), (-.2, 0, .197), (.25, 0, .225), (.65, 0, .17)], line_mat, .002)
    kintsugi_lines(line_mat, bronze_mat)
    clockwork_heart(line_mat, bronze_mat, turquoise_mat)
    gilded_fins(line_mat)

    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "assets" / f"koi-{kind}.blend"))
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=str(OUT / f"koi-{kind}.glb"), export_format="GLB", use_selection=True, export_apply=True)
    print("BUILT", kind)


build("kintsugi")
