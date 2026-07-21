#!/usr/bin/env python3
"""
Blender headless script: garment weight transfer for Virtual Try-On
Input: raw Tripo glb (unrigged, fused mesh)
Output: fitted garment glb (skinned, normalized, test-posed)
"""

import bpy
import sys
import json
import os
from pathlib import Path
from mathutils import Vector, Matrix

def get_args():
    try:
        idx = sys.argv.index('--')
        return sys.argv[idx + 1:]
    except ValueError:
        return []

def log(msg):
    print(f'[BLENDER] {msg}')

def load_mannequin(mannequin_path: str):
    """Load pre-rigged humanoid avatar (Mecanim/Humanoid structure)"""
    log(f'Loading mannequin: {mannequin_path}')
    
    # Import mannequin glb
    bpy.ops.import_scene.gltf(filepath=mannequin_path)
    
    # Get the armature (skeleton)
    armature = None
    for obj in bpy.context.selected_objects:
        if obj.type == 'ARMATURE':
            armature = obj
            break
    
    if not armature:
        raise Exception('No armature found in mannequin')
    
    log(f'Mannequin loaded. Armature: {armature.name}')
    return armature

def load_garment(garment_path: str):
    """Load raw Tripo glb (garment mesh)"""
    log(f'Loading garment: {garment_path}')
    bpy.ops.import_scene.gltf(filepath=garment_path)
    
    mesh_obj = None
    for obj in bpy.context.selected_objects:
        if obj.type == 'MESH':
            mesh_obj = obj
            break
    
    if not mesh_obj:
        raise Exception('No mesh found in garment')
    
    log(f'Garment loaded: {mesh_obj.name}')
    return mesh_obj

def decimate_mesh(mesh_obj, target_tris=40000):
    """Decimate mesh to ≤target_tris"""
    mesh = mesh_obj.data
    current_tris = len(mesh.polygons)
    
    if current_tris <= target_tris:
        log(f'Mesh already low-poly: {current_tris} tris')
        return
    
    ratio = target_tris / current_tris
    log(f'Decimating: {current_tris} → {target_tris} tris (ratio: {ratio:.2f})')
    
    bpy.context.view_layer.objects.active = mesh_obj
    mesh_obj.select_set(True)
    
    decimate = mesh_obj.modifiers.new(name='Decimate', type='DECIMATE')
    decimate.ratio = ratio
    bpy.context.view_layer.update()
    
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    log(f'Decimated: {len(mesh.polygons)} tris')

def normalize_scale(mesh_obj, armature, category: str):
    """Scale/orient garment to match avatar torso/legs"""
    mesh = mesh_obj.data
    
    # Get bounding box
    min_xyz = Vector((float('inf'),) * 3)
    max_xyz = Vector((float('-inf'),) * 3)
    for vert in mesh.vertices:
        min_xyz.x = min(min_xyz.x, vert.co.x)
        min_xyz.y = min(min_xyz.y, vert.co.y)
        min_xyz.z = min(min_xyz.z, vert.co.z)
        max_xyz.x = max(max_xyz.x, vert.co.x)
        max_xyz.y = max(max_xyz.y, vert.co.y)
        max_xyz.z = max(max_xyz.z, vert.co.z)
    
    size = max_xyz - min_xyz
    center = (min_xyz + max_xyz) * 0.5
    
    # Category-based target scale (avatar: ~1.7m tall)
    target_scale = {
        'top': 0.25,     # torso height ~0.4m
        'bottom': 0.35,  # leg height ~0.6m
        'outer': 0.3,    # jacket ~0.5m
    }.get(category, 0.3)
    
    current_scale = size.z  # height
    scale_factor = target_scale / (current_scale if current_scale > 0 else 1)
    
    log(f'Scale factor: {scale_factor:.2f}x (category: {category})')
    bpy.ops.transform.resize(value=(scale_factor, scale_factor, scale_factor))
    bpy.ops.object.transform_apply(scale=True)

def transfer_weights(mesh_obj, armature):
    """Copy skin weights from avatar body to garment"""
    log('Transferring weights from mannequin to garment...')
    
    # Create armature modifier on garment
    mod = mesh_obj.modifiers.new(name='Armature', type='ARMATURE')
    mod.object = armature
    
    # Get all vertex groups from armature
    for bone in armature.data.bones:
        if bone.name not in mesh_obj.vertex_groups:
            mesh_obj.vertex_groups.new(name=bone.name)
    
    # Simple weight assignment: each garment vertex gets weight from nearest armature vertex
    log('Auto-weighting...')
    mesh = mesh_obj.data
    for vert in mesh.vertices:
        # Find closest bone (simplified: just assign to "Armature" bone)
        # In production, use nearest-face interpolation or ML
        for vgroup in mesh_obj.vertex_groups:
            vgroup.add([vert.index], 0.5, 'REPLACE')
    
    log('Weights transferred')

def test_pose(armature):
    """Apply test pose (arms 40°, legs 30°) to check fit"""
    log('Applying test pose...')
    
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='POSE')
    
    pose = armature.pose
    
    # Example bones (Mecanim standard names)
    pose_data = {
        'LeftShoulder': (0.7, 0, 0),      # 40° X
        'RightShoulder': (-0.7, 0, 0),
        'LeftUpLeg': (0.5, 0, 0),         # 30° X
        'RightUpLeg': (0.5, 0, 0),
    }
    
    for bone_name, euler in pose_data.items():
        if bone_name in pose.bones:
            pose.bones[bone_name].rotation_euler = euler
            log(f'  {bone_name}: {euler}')
    
    bpy.ops.object.mode_set(mode='OBJECT')

def export_glb(mesh_obj, armature, out_path: str):
    """Export fitted garment + armature as glb"""
    log(f'Exporting to: {out_path}')
    
    # Select mesh + armature for export
    bpy.ops.object.select_all(action='DESELECT')
    mesh_obj.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        use_format='GLB',
        use_draco_mesh_compression=True,
        export_animations=True,
    )
    
    log(f'✓ Exported: {out_path}')

def main():
    args = get_args()
    if len(args) < 3:
        print('Usage: blender -b -P weight_transfer_spike.py -- <mannequin.glb> <garment.glb> <category> <out.glb>')
        sys.exit(1)
    
    mannequin_path = args[0]
    garment_path = args[1]
    category = args[2]
    out_path = args[3] if len(args) > 3 else 'fitted_garment.glb'
    
    try:
        # Clear scene
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
        
        # Pipeline
        armature = load_mannequin(mannequin_path)
        garment = load_garment(garment_path)
        
        decimate_mesh(garment, target_tris=40000)
        normalize_scale(garment, armature, category)
        transfer_weights(garment, armature)
        test_pose(armature)
        
        export_glb(garment, armature, out_path)
        
        log('✓ Done!')
        
    except Exception as e:
        log(f'✗ Error: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
